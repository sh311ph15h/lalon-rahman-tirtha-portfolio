// Lab case files shown in the Security section.
// Recon facts (ports, services, hosts) come from Lalon's own scan output and lab
// templates; phases are summarised at a high level and mapped to MITRE ATT&CK.

export const labs = [
  {
    id: 'blue',
    name: 'Blue',
    kind: 'Windows host · home lab',
    target: 'Windows 7 Ultimate SP1',
    date: 'Jun 2026',
    ports: [
      { port: '135', svc: 'msrpc' },
      { port: '139', svc: 'netbios-ssn' },
      { port: '445', svc: 'microsoft-ds', hot: true },
      { port: '49152–6', svc: 'msrpc' },
    ],
    finding: 'SMBv1 exposed on an unpatched Windows 7 host, and SMB message signing disabled.',
    phases: [
      { phase: 'Recon', attack: 'T1046', text: 'Full TCP port and service scan; SMB stood out as the only real attack surface.' },
      { phase: 'Enumeration', attack: 'T1082', text: 'OS discovery over SMB identified Windows 7 SP1 with guest access and no signing.' },
      { phase: 'Initial access', attack: 'T1210', text: 'Matched the build against the MS17-010 SMB vulnerability and confirmed it in the lab.' },
      { phase: 'Impact', attack: 'T1068', text: 'Remote code execution as SYSTEM: one missing patch meant full control of the host.' },
    ],
    lesson: 'Patch MS17-010, disable SMBv1, require SMB signing, and keep port 445 off untrusted networks.',
  },
  {
    id: 'butler',
    name: 'Butler',
    kind: 'Windows host · home lab',
    target: 'Windows 10 · Jenkins on Jetty',
    date: 'Jun 2026',
    ports: [
      { port: '135', svc: 'msrpc' },
      { port: '139', svc: 'netbios-ssn' },
      { port: '445', svc: 'microsoft-ds' },
      { port: '8080', svc: 'Jetty 9.4.41 (Jenkins)', hot: true },
    ],
    finding: 'Jenkins admin console reachable with weak credentials, plus a service installed on an unquoted path.',
    phases: [
      { phase: 'Recon', attack: 'T1046', text: 'All 65,535 ports scanned; a Jenkins server on 8080 was the way in.' },
      { phase: 'Credential access', attack: 'T1110', text: 'Weak Jenkins login found by testing credentials through Burp Suite.' },
      { phase: 'Execution', attack: 'T1059', text: "Jenkins' built-in script console gave command execution as a low-privilege user." },
      { phase: 'Privilege escalation', attack: 'T1574.009', text: 'Local enumeration found a third-party service with an unquoted path, which escalated to SYSTEM.' },
    ],
    lesson: 'Strong unique admin passwords, keep Jenkins off the network edge, and quote service paths with locked-down folder permissions.',
  },
  {
    id: 'ad',
    name: 'MARVEL.local',
    kind: 'Active Directory · AWS lab I built',
    target: 'Windows Server 2019 domain + 2 workstations',
    date: 'Aug 2026',
    ports: [
      { port: '88', svc: 'kerberos' },
      { port: '389', svc: 'ldap' },
      { port: '445', svc: 'smb', hot: true },
      { port: '5355', svc: 'llmnr', hot: true },
    ],
    finding: 'Default Windows name resolution and unsigned SMB let one captured credential spread across the domain.',
    phases: [
      { phase: 'Build', attack: '—', text: 'Deployed the whole domain with CloudFormation: DC, two joined workstations and a Kali box in an isolated VPC.' },
      { phase: 'Credential access', attack: 'T1557.001', text: 'LLMNR/NBT-NS poisoning captured NTLMv2 hashes, cracked offline against a weak password.' },
      { phase: 'Lateral movement', attack: 'T1550.002', text: 'Unsigned SMB and reused local admin credentials opened the other workstations.' },
      { phase: 'Domain compromise', attack: 'T1003.006', text: 'Escalated to domain admin and pulled the domain credential store.' },
    ],
    lesson: 'Disable LLMNR/NBT-NS, enforce SMB signing, use LAPS for local admin, and tier admin accounts.',
  },
  {
    id: 'xlmrat',
    name: 'XLMRat',
    kind: 'Blue team · malware traffic analysis',
    target: 'Packet capture of a live infection',
    date: 'Oct 2026',
    ports: [
      { port: '222', svc: 'HTTP payload host', hot: true },
      { port: 'VBS', svc: 'obfuscated dropper' },
      { port: '.jpg', svc: 'disguised payload', hot: true },
    ],
    finding: 'A VBScript loader fetched a PowerShell payload disguised as a JPEG from a non-standard port.',
    phases: [
      { phase: 'Triage', attack: 'T1071.001', text: 'Isolated the suspicious HTTP session in Wireshark: a ".jpg" served over port 222.' },
      { phase: 'Deobfuscation', attack: 'T1027', text: 'Rebuilt the dropper from 89 shuffled string fragments to recover the PowerShell it runs.' },
      { phase: 'Payload', attack: 'T1036.008', text: 'The "image" was a PowerShell script carrying the RAT, not a picture.' },
      { phase: 'Report', attack: '—', text: 'Pulled IOCs (IP, port, file names) and mapped the chain to ATT&CK for detection rules.' },
    ],
    lesson: 'Alert on executable content from image URLs, and on HTTP to unusual ports from script hosts.',
  },
]

// Anonymised: a security review of a live client system.
export const review = {
  title: 'Security review of a live production web app',
  scope: 'Source code + deployed system · Next.js and Postgres',
  counts: [
    { sev: 'Critical', n: 1, color: '#f43f5e' },
    { sev: 'High', n: 3, color: '#f97316' },
    { sev: 'Medium', n: 5, color: '#eab308' },
    { sev: 'Low', n: 5, color: '#64748b' },
  ],
  highlights: [
    'Database exposed through its public API, bypassing the app (verified safely)',
    'No login rate limiting; session tokens never expired',
    'Missing security headers and outdated dependencies',
  ],
  held: 'Parameterised queries throughout, scrypt password hashing, no XSS sinks found',
}
