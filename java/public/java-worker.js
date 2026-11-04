// Runs Java in the browser with CheerpJ (https://cheerpj.com, runtime loaded from CheerpJ's CDN). This is a classic Web
// Worker so that the page can stop a program that never ends by simply terminating the worker.
//
// How a run works:
//   1. The learner's code is compiled with javac (which also runs inside CheerpJ), together with Runner (below).
//   2. Runner starts ONE JVM and runs every test in it. Each test gets a brand new class loader, so static fields
//      start fresh like in a new process, its own stdin (a file) and its own captured stdout and stderr.
//   3. Runner prints a line per test on the real stdout: \u0001BEGIN\t<i> and \u0001END\t<i>\t<status>\t<ms>\t<stdout>\t<stderr>
//      (outputs in Base64). This worker reads those lines and sends them on. Other lines are ignored.

importScripts('https://cjrtnc.leaningtech.com/5.0/loader.js');

const ENGINE_OPTIONS = { version: 21, status: 'none', javaProperties: ['java.security.manager=allow'] };

const RUNNER = String.raw`
import java.io.*;
import java.lang.reflect.*;
import java.net.*;
import java.security.Permission;
import java.util.Base64;

public class Runner {
    static final int MAX_OUT = 4 * 1024 * 1024;

    // These two are only signals. Skipping the stack trace makes them cheap (in the browser building one is slow).
    static class Limit extends Error {
        public synchronized Throwable fillInStackTrace() { return this; }
    }

    static class ExitSignal extends SecurityException {
        final int code;
        ExitSignal(int code) { super("exit " + code); this.code = code; }
        public synchronized Throwable fillInStackTrace() { return this; }
    }

    static class Capture extends OutputStream {
        final ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        public void write(int b) { if (bytes.size() >= MAX_OUT) throw new Limit(); bytes.write(b); }
        public void write(byte[] b, int off, int len) { if (bytes.size() + len > MAX_OUT) throw new Limit(); bytes.write(b, off, len); }
    }

    static String b64(Capture c) { return Base64.getEncoder().encodeToString(c.bytes.toByteArray()); }

    // A short, readable error text for the learner (no frames from this runner).
    static String describe(Throwable t) {
        StackTraceElement[] frames = t.getStackTrace();
        if (frames.length > 120) {
            return "Stack overflow: the recursion is too deep. In the browser Java allows only about 3000 nested calls.\n";
        }
        StringBuilder sb = new StringBuilder("Exception in thread \"main\" ").append(t).append('\n');
        int shown = 0;
        for (StackTraceElement f : frames) {
            String c = f.getClassName();
            if (c.startsWith("java.lang.invoke") || c.startsWith("java.lang.reflect") || c.startsWith("jdk.internal.reflect") || c.equals("Runner")) break;
            if (shown++ >= 20) { sb.append("\t...\n"); break; }
            sb.append("\tat ").append(f).append('\n');
        }
        if (t.getCause() != null) sb.append("Caused by: ").append(t.getCause()).append('\n');
        return sb.toString();
    }

    public static void main(String[] args) throws Exception {
        String mainClass = args[0];
        String dir = args[1];
        int count = Integer.parseInt(args[2]);

        // System.exit inside the learner's program must end that test, not the whole run.
        System.setSecurityManager(new SecurityManager() {
            public void checkExit(int status) { throw new ExitSignal(status); }
            public void checkPermission(Permission p) { }
            public void checkPermission(Permission p, Object context) { }
        });

        PrintStream realOut = System.out, realErr = System.err;
        for (int i = 0; i < count; i++) {
            Capture out = new Capture(), err = new Capture();
            System.setIn(new FileInputStream("/str/in" + i + ".txt"));
            System.setOut(new PrintStream(out, false, "UTF-8"));
            System.setErr(new PrintStream(err, false, "UTF-8"));
            realOut.println("\u0001BEGIN\t" + i);
            realOut.flush();
            long started = System.nanoTime();
            String status = "ok";
            try {
                // The parent is the platform loader, so the learner's class is loaded again for every test.
                URLClassLoader loader = new URLClassLoader(new URL[] { new File(dir).toURI().toURL() }, ClassLoader.getPlatformClassLoader());
                Method main = Class.forName(mainClass, true, loader).getMethod("main", String[].class);
                main.invoke(null, (Object) new String[0]);
            } catch (InvocationTargetException e) {
                Throwable c = e.getCause();
                if (c instanceof ExitSignal) {
                    int code = ((ExitSignal) c).code;
                    if (code != 0) { status = "runtime_error"; System.err.println("The program ended with exit code " + code + "."); }
                } else if (c instanceof Limit) {
                    status = "output_limit";
                } else if (c instanceof OutOfMemoryError) {
                    status = "memory_limit";
                } else {
                    status = "runtime_error";
                    System.err.print(describe(c));
                }
            } catch (Limit e) {
                status = "output_limit";
            } catch (Throwable t) {
                status = "runtime_error";
                System.err.print(describe(t));
            }
            long ms = (System.nanoTime() - started) / 1000000;
            System.out.flush();
            System.err.flush();
            System.setOut(realOut);
            System.setErr(realErr);
            realOut.println("\u0001END\t" + i + "\t" + status + "\t" + ms + "\t" + b64(out) + "\t" + b64(err));
            realOut.flush();
        }
    }
}
`;

const decoder = new TextDecoder();
function fromBase64(text) {
  if (!text) return '';
  const raw = atob(text);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return decoder.decode(bytes);
}

let phase = 'idle';           // 'compile' while javac runs: then ordinary lines are compiler messages
let compileLines = [];
let currentId = null;         // the request that is running
let pending = '';             // text of the real stdout that does not end in a newline yet
let counter = 0;

function handleLine(line) {
  if (line.charCodeAt(0) === 1) {
    const f = line.slice(1).split('\t');
    if (f[0] === 'BEGIN') postMessage({ type: 'begin', id: currentId, i: Number(f[1]) });
    else if (f[0] === 'END') postMessage({ type: 'case', id: currentId, i: Number(f[1]), status: f[2], ms: Number(f[3]), stdout: fromBase64(f[4]), stderr: fromBase64(f[5]) });
  } else if (phase === 'compile' && line.trim() && !/^CheerpJ runtime ready/.test(line)) {
    compileLines.push(line);
  }
}

// Everything Java prints on the real stdout arrives here, in pieces of any size.
console.log = (...args) => {
  pending += args.map(String).join(' ');
  let nl;
  while ((nl = pending.indexOf('\n')) >= 0) {
    const line = pending.slice(0, nl);
    pending = pending.slice(nl + 1);
    handleLine(line);
  }
};
console.error = console.log;

// The name of the class to run: the public class, or the first class that has main.
function findMainClass(code) {
  const text = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const pub = /\bpublic\s+(?:(?:final|abstract|strictfp)\s+)*class\s+([A-Za-z_$][\w$]*)/.exec(text);
  if (pub) return pub[1];
  const first = /\bclass\s+([A-Za-z_$][\w$]*)/.exec(text);
  return first ? first[1] : 'Main';
}

self.onmessage = async (event) => {
  const m = event.data;
  currentId = m.id === undefined ? null : m.id;
  try {
    if (m.type === 'init') {
      await cheerpjInit(ENGINE_OPTIONS);
      postMessage({ type: 'ready', id: currentId });
    } else if (m.type === 'compile') {
      const mainClass = findMainClass(m.code);
      const dir = '/files/c' + (++counter);
      cheerpOSAddStringFile('/str/' + mainClass + '.java', m.code);
      cheerpOSAddStringFile('/str/Runner.java', RUNNER);
      phase = 'compile';
      compileLines = [];
      const rc = await cheerpjRunMain('com.sun.tools.javac.Main', '', '-encoding', 'UTF-8', '-d', dir, '/str/' + mainClass + '.java', '/str/Runner.java');
      phase = 'idle';
      const log = compileLines.join('\n').split('/str/').join('');
      postMessage({ type: 'compiled', id: currentId, rc, log: rc === 0 ? '' : log, dir, mainClass });
    } else if (m.type === 'run') {
      m.tests.forEach((input, i) => cheerpOSAddStringFile('/str/in' + i + '.txt', input));
      const rc = await cheerpjRunMain('Runner', m.dir, m.mainClass, m.dir, String(m.tests.length));
      postMessage({ type: 'done', id: currentId, rc });
    }
  } catch (error) {
    phase = 'idle';
    postMessage({ type: 'error', id: currentId, error: String((error && error.message) || error).slice(0, 600) });
  }
};
