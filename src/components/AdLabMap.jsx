// Network map of the MARVEL.local lab, from the CloudFormation template.
const nodes = [
  { id: 'kali', x: 70, y: 150, label: 'Kali-Attacker', sub: '10.0.1.7', color: '#f43f5e' },
  { id: 'dc', x: 330, y: 60, label: 'HYDRA-DC', sub: 'Server 2019 · DC', color: '#22d3ee' },
  { id: 'ws1', x: 330, y: 150, label: 'THEPUNISHER', sub: 'workstation', color: '#a78bfa' },
  { id: 'ws2', x: 330, y: 240, label: 'SPIDERMAN', sub: 'workstation', color: '#a78bfa' },
]
const links = [['kali', 'ws1'], ['kali', 'ws2'], ['ws1', 'dc'], ['ws2', 'dc']]
const at = (id) => nodes.find((n) => n.id === id)

export function AdLabMap() {
  return (
    <figure className="flex flex-col rounded-xl border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-accent">Infrastructure as code</p>
      <h3 className="mt-1 text-lg font-bold">Active Directory lab on AWS</h3>
      <svg viewBox="0 0 440 300" className="mt-3 w-full" role="img" aria-label="Kali attacker box connected to two domain workstations, which connect to the HYDRA domain controller, inside VPC 10.0.0.0/16">
        <rect x="8" y="16" width="424" height="276" rx="10" fill="none" stroke="#232d44" strokeDasharray="5 5" />
        <text x="20" y="34" fill="#94a0b8" fontSize="11" fontFamily="JetBrains Mono, monospace">VPC 10.0.0.0/16 · subnet 10.0.1.0/24 · ap-southeast-2</text>
        {links.map(([a, b]) => {
          const A = at(a), B = at(b)
          return (
            <line key={a + b} x1={A.x + 50} y1={A.y} x2={B.x - 50} y2={B.y} stroke={a === 'kali' ? '#f43f5e' : '#22d3ee'} strokeOpacity=".6" strokeWidth="1.6" strokeDasharray="6 6" className="ad-flow" />
          )
        })}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x - 52} y={n.y - 22} width="104" height="44" rx="8" fill="#1a2236" stroke={n.color} strokeOpacity=".8" />
            <text x={n.x} y={n.y - 3} textAnchor="middle" fill="#e5e9f2" fontSize="11" fontWeight="700" fontFamily="JetBrains Mono, monospace">{n.label}</text>
            <text x={n.x} y={n.y + 12} textAnchor="middle" fill="#94a0b8" fontSize="9.5" fontFamily="JetBrains Mono, monospace">{n.sub}</text>
          </g>
        ))}
      </svg>
      <figcaption className="mt-3 text-sm leading-relaxed text-muted">
        One CloudFormation template builds the whole domain, locked to my IP, so I can spin it up, attack it, and tear it down for a few dollars.
      </figcaption>
    </figure>
  )
}
