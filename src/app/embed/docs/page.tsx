export default function EmbedDocsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Matchfeel Embed Widget</h1>
      <p className="text-zinc-400 mb-8">
        Embed real-time World Cup reactions on your site.
      </p>

      {/* How to embed */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">How to embed</h2>
        <p className="text-zinc-400 mb-3">
          Copy and paste this iframe into your HTML:
        </p>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm overflow-x-auto">
          <code className="text-emerald-400">{`<iframe
  src="https://mundial.diegodella.ar/embed?match_id=YOUR_MATCH_ID"
  width="100%"
  height="400"
  frameborder="0"
  allow="autoplay"
  style="border: none; border-radius: 8px;"
></iframe>`}</code>
        </pre>
      </section>

      {/* Parameters */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Parameters</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 pr-4 text-zinc-400 font-medium">Parameter</th>
                <th className="text-left py-2 pr-4 text-zinc-400 font-medium">Required</th>
                <th className="text-left py-2 pr-4 text-zinc-400 font-medium">Default</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4"><code className="text-amber-400">match_id</code></td>
                <td className="py-2 pr-4 text-zinc-400">Yes</td>
                <td className="py-2 pr-4 text-zinc-500">-</td>
                <td className="py-2 text-zinc-400">UUID of the match to display</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4"><code className="text-amber-400">lang</code></td>
                <td className="py-2 pr-4 text-zinc-400">No</td>
                <td className="py-2 pr-4 text-zinc-500">es</td>
                <td className="py-2 text-zinc-400">Language: <code className="text-zinc-300">es</code> or <code className="text-zinc-300">en</code></td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4"><code className="text-amber-400">view</code></td>
                <td className="py-2 pr-4 text-zinc-400">No</td>
                <td className="py-2 pr-4 text-zinc-500">both</td>
                <td className="py-2 text-zinc-400">View mode: <code className="text-zinc-300">map</code>, <code className="text-zinc-300">reactions</code>, or <code className="text-zinc-300">both</code></td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-2 pr-4"><code className="text-amber-400">theme</code></td>
                <td className="py-2 pr-4 text-zinc-400">No</td>
                <td className="py-2 pr-4 text-zinc-500">dark</td>
                <td className="py-2 text-zinc-400">Color scheme: <code className="text-zinc-300">light</code> or <code className="text-zinc-300">dark</code></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Examples */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-3">Examples</h2>

        <h3 className="text-sm font-medium text-zinc-400 mb-2 mt-4">Dark theme, map only, English</h3>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm overflow-x-auto mb-4">
          <code className="text-emerald-400">{`<iframe
  src="https://mundial.diegodella.ar/embed?match_id=XXX&lang=en&view=map&theme=dark"
  width="100%"
  height="300"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`}</code>
        </pre>

        <h3 className="text-sm font-medium text-zinc-400 mb-2">Light theme, reactions counter only</h3>
        <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm overflow-x-auto">
          <code className="text-emerald-400">{`<iframe
  src="https://mundial.diegodella.ar/embed?match_id=XXX&view=reactions&theme=light"
  width="100%"
  height="120"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`}</code>
        </pre>
      </section>

      {/* Footer */}
      <div className="border-t border-zinc-800 pt-6">
        <a
          href="https://mundial.diegodella.ar"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; Back to Matchfeel
        </a>
      </div>
    </div>
  );
}
