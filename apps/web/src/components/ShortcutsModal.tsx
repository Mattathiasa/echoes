import { useEffect, useState } from "react";
import { X, Keyboard } from "lucide-react";

const shortcuts = [
  { key: "Space", description: "Start / stop recording (Record page)" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "Esc", description: "Close this dialog" },
];

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        return;
      }
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if ((e.target as HTMLElement).isContentEditable) return;
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm px-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-violet-400" />
            <h2 className="font-semibold text-zinc-100">Keyboard shortcuts</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-800">
            {shortcuts.map(({ key, description }) => (
              <tr key={key}>
                <td className="py-2.5 pr-4 w-20">
                  <kbd className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-300">
                    {key}
                  </kbd>
                </td>
                <td className="py-2.5 text-zinc-400">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-xs text-zinc-600 text-center">
          Press <kbd className="text-xs font-mono text-zinc-500">?</kbd> or{" "}
          <kbd className="text-xs font-mono text-zinc-500">Esc</kbd> to close
        </p>
      </div>
    </div>
  );
}
