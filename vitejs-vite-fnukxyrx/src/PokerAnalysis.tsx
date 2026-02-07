import { useState, useEffect, useRef } from 'react';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; pulse: number }[] = [];
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: 2 + Math.random() * 3,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const dataStreams: { x: number; y: number; speed: number; value: string }[] = [];
    for (let i = 0; i < 20; i++) {
      dataStreams.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1,
        value: (Math.random() * 100).toFixed(2),
      });
    }

    const cubeVertices: [number, number, number][] = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];
    const cubeEdges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const animate = () => {
      time += 0.006;
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#0a1628');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerGlow = ctx.createRadialGradient(
        canvas.width * 0.5, canvas.height * 0.4, 0,
        canvas.width * 0.5, canvas.height * 0.4, canvas.width * 0.6
      );
      centerGlow.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      centerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let c = 0; c < 6; c++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
        ctx.lineWidth = 1;
        const yBase = canvas.height * (0.15 + c * 0.15);
        const amplitude = 40 + c * 15;
        for (let x = 0; x < canvas.width; x += 3) {
          const y = yBase + Math.sin(x * 0.004 + time + c * 0.5) * amplitude + Math.sin(x * 0.009 + time * 1.3) * (amplitude * 0.4);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.lineWidth = 0.5;
      nodes.forEach((n1, i) => {
        nodes.slice(i + 1).forEach((n2) => {
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < 180) {
            ctx.strokeStyle = 'rgba(96, 165, 250, 0.15)';
            ctx.globalAlpha = 1 - dist / 180;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += 0.03;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
        const pulseSize = node.radius + Math.sin(node.pulse) * 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(147, 197, 253, 0.8)';
        ctx.fill();
      });

      ctx.font = '10px monospace';
      dataStreams.forEach((stream) => {
        stream.y += stream.speed;
        if (stream.y > canvas.height + 20) {
          stream.y = -20;
          stream.x = Math.random() * canvas.width;
          stream.value = (Math.random() * 100).toFixed(2);
        }
        ctx.fillStyle = 'rgba(147, 197, 253, 0.15)';
        ctx.fillText(stream.value, stream.x, stream.y);
      });

      const cubeX = canvas.width - 150, cubeY = 150, cubeSize = 60;
      const project = (v: [number, number, number]): [number, number] => {
        const [x, y, z] = v;
        const cosY = Math.cos(time * 0.5), sinY = Math.sin(time * 0.5);
        const x1 = x * cosY - z * sinY, z1 = x * sinY + z * cosY;
        const cosX = Math.cos(time * 0.3), sinX = Math.sin(time * 0.3);
        const y1 = y * cosX - z1 * sinX;
        const scale = 200 / (200 + (y * sinX + z1 * cosX) * 30);
        return [cubeX + x1 * cubeSize * scale, cubeY + y1 * cubeSize * scale];
      };
      const projected = cubeVertices.map(project);
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.lineWidth = 1;
      cubeEdges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i][0], projected[i][1]);
        ctx.lineTo(projected[j][0], projected[j][1]);
        ctx.stroke();
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />;
};

const GlassPanel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`backdrop-blur-xl bg-white/[0.03] border-white/[0.08] border rounded-2xl ${className}`}>
    {children}
  </div>
);

const RawDataSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const sessions = [
    { id: 1, date: '2025-10-02', type: 'Poker Society', profit: -18.00 },
    { id: 2, date: '2025-10-09', type: 'Poker Society', profit: 10.25 },
    { id: 3, date: '2025-10-24', type: 'Random Home Game', profit: 69.00 },
    { id: 4, date: '2025-10-30', type: 'Friend Games', profit: 38.00 },
    { id: 5, date: '2025-11-03', type: 'Friend Games', profit: -17.60 },
    { id: 6, date: '2025-11-04', type: 'Friend Games', profit: -7.70 },
    { id: 7, date: '2025-11-07', type: 'Friend Games', profit: -19.50 },
    { id: 8, date: '2025-11-07', type: 'Friend Games', profit: -16.60 },
    { id: 9, date: '2025-11-08', type: 'Random Home Game', profit: 138.00 },
    { id: 10, date: '2025-11-11', type: 'Friend Games', profit: 37.00 },
    { id: 11, date: '2025-11-14', type: 'Friend Games', profit: -0.60 },
    { id: 12, date: '2025-11-18', type: 'Friend Games', profit: 4.80 },
    { id: 13, date: '2025-11-19', type: 'Friend Games', profit: 10.30 },
    { id: 14, date: '2025-11-20', type: 'Friend Games', profit: 5.85 },
    { id: 15, date: '2025-11-28', type: 'Friend Games', profit: -46.40 },
    { id: 16, date: '2025-11-29', type: 'Random Home Game', profit: -86.40 },
    { id: 17, date: '2025-12-02', type: 'Friend Games', profit: -17.20 },
    { id: 18, date: '2025-12-03', type: 'Friend Games', profit: -26.40 },
    { id: 19, date: '2025-12-04', type: 'Friend Games', profit: 46.50 },
    { id: 20, date: '2025-12-04', type: 'Poker Society', profit: 21.50 },
    { id: 21, date: '2025-12-08', type: 'Friend Games', profit: 27.20 },
    { id: 22, date: '2025-12-09', type: 'Friend Games', profit: -17.40 },
    { id: 23, date: '2025-12-09', type: 'Hindu Society', profit: 25.50 },
    { id: 24, date: '2025-12-09', type: 'Friend Games', profit: -10.00 },
    { id: 25, date: '2025-12-10', type: 'Friend Games', profit: 3.40 },
    { id: 26, date: '2025-12-10', type: 'Friend Games', profit: -20.00 },
    { id: 27, date: '2025-12-11', type: 'Poker Society', profit: 3.51 },
    { id: 28, date: '2026-01-16', type: 'Friend Games', profit: 70.60 },
    { id: 29, date: '2026-01-19', type: 'Friend Games', profit: -20.20 },
    { id: 30, date: '2026-01-21', type: 'Friend Games', profit: -12.00 },
    { id: 31, date: '2026-01-22', type: 'Friend Games', profit: 14.00 },
    { id: 32, date: '2026-01-23', type: 'Random Home Game', profit: -13.00 },
    { id: 33, date: '2026-01-27', type: 'Friend Games', profit: 23.00 },
    { id: 34, date: '2026-01-29', type: 'Poker Society', profit: 28.65 },
    { id: 35, date: '2026-01-29', type: 'Poker Society', profit: 18.80 },
    { id: 36, date: '2026-02-02', type: 'Random Home Game', profit: 28.00 },
  ];

  return (
    <GlassPanel className="p-8">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h3 className="text-xl font-semibold text-white">View Raw Data</h3>
        <span className={`text-blue-400 text-2xl transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">All 36 sessions from October 2024 - February 2026</p>
            <a 
              href="https://github.com/Aanu30/pokeranalysis/blob/main/pokeranalysis/data/sessions.csv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Download CSV →
            </a>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-900">
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="text-left py-3 px-2">#</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-left py-3 px-2">Game Type</th>
                  <th className="text-right py-3 px-2">Profit/Loss</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-2 px-2 text-gray-500">{session.id}</td>
                    <td className="py-2 px-2">{session.date}</td>
                    <td className="py-2 px-2">{session.type}</td>
                    <td className={`py-2 px-2 text-right font-mono ${session.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {session.profit >= 0 ? '+' : ''}£{session.profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm">
            <span className="text-gray-400">Total: <span className="text-emerald-400 font-mono">£274.86</span></span>
            <span className="text-gray-400">Avg: <span className="text-white font-mono">£7.64/session</span></span>
          </div>
        </div>
      )}
    </GlassPanel>
  );
};

const GITHUB_RAW = 'https://raw.githubusercontent.com/Aanu30/pokeranalysis/main/pokeranalysis/outputs';

export default function PokerAnalysis({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalSessions: 36,
    totalProfit: 274.86,
    winRate: 55.6,
    avgProfit: 7.64,
    stdDev: 37.79,
    probWinning: 88.6,
    sessionsFor80Power: 195,
    currentPower: 21.8,
    maxDrawdown: -176.4,
    effectSize: 0.202,
  };

  return (
    <div className="min-h-screen bg-transparent text-white overflow-x-hidden">
      <AnimatedBackground />
      
      <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
        <GlassPanel className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <button onClick={onBack} className="font-bold tracking-tight text-lg text-white hover:text-blue-400 transition-colors">
            ← Back to Portfolio
          </button>
          <a 
            href="https://github.com/Aanu30/pokeranalysis" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all"
          >
            View on GitHub
          </a>
        </GlassPanel>
      </nav>

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Poker', 'Statistics', 'ST202'].map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-400">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-light mb-4 text-white" style={{
            textShadow: '0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.3)',
          }}>
            Analysing 36 Poker Sessions
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            What the Data Says About My Edge
          </p>
          <p className="text-gray-400 max-w-3xl">
            A statistical breakdown of my live poker results using hypothesis testing, maximum likelihood estimation, 
            Bayesian inference, and bootstrap resampling. Built as a practical application of concepts from
            <span className="text-blue-400"> ST202 - Probability and Statistical Inference</span> at LSE.
          </p>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassPanel className="p-6 text-center">
              <div className="text-3xl font-bold mb-1 text-white">{stats.totalSessions}</div>
              <div className="text-sm text-gray-400">Sessions</div>
              <div className="text-xs mt-1 text-gray-600">Oct 2024 - Feb 2026</div>
            </GlassPanel>
            <GlassPanel className="p-6 text-center">
              <div className="text-3xl font-bold mb-1 text-white">£{stats.totalProfit}</div>
              <div className="text-sm text-gray-400">Total Profit</div>
              <div className="text-xs mt-1 text-gray-600">Net result</div>
            </GlassPanel>
            <GlassPanel className="p-6 text-center">
              <div className="text-3xl font-bold mb-1 text-white">{stats.winRate}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
              <div className="text-xs mt-1 text-gray-600">Winning sessions</div>
            </GlassPanel>
            <GlassPanel className="p-6 text-center">
              <div className="text-3xl font-bold mb-1 text-white">{stats.probWinning}%</div>
              <div className="text-sm text-gray-400">P(Positive Edge)</div>
              <div className="text-xs mt-1 text-gray-600">Bayesian posterior</div>
            </GlassPanel>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <GlassPanel className="p-8 border-blue-500/30">
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Verdict</h2>
            <p className="text-lg text-gray-300">
              The data suggests an <span className="text-white font-semibold">89% probability of a positive edge</span>, 
              but <span className="text-white font-semibold">159 more sessions</span> are needed to achieve 
              statistical significance at 80% power.
            </p>
          </GlassPanel>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-8">
            {['overview', 'frequentist', 'bayesian', 'bootstrap', 'power'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Cumulative Profit Over Time</h3>
                <img 
                  src={`${GITHUB_RAW}/01_cumulative_profit.png`} 
                  alt="Cumulative Profit Over Time" 
                  className="w-full rounded-lg"
                />
              </GlassPanel>

              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Individual Session Results</h3>
                <img 
                  src={`${GITHUB_RAW}/02_session_profits.png`} 
                  alt="Individual Session Results" 
                  className="w-full rounded-lg"
                />
              </GlassPanel>

              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Summary Statistics</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Sessions</span>
                      <span className="text-white">{stats.totalSessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Profit</span>
                      <span className="text-emerald-400">£{stats.totalProfit}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Win Rate</span>
                      <span className="text-white">{stats.winRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Avg Profit/Session</span>
                      <span className="text-white">£{stats.avgProfit}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Standard Deviation</span>
                      <span className="text-white">£{stats.stdDev}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Max Drawdown</span>
                      <span className="text-red-400">£{stats.maxDrawdown}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Effect Size (Cohen d)</span>
                      <span className="text-white">{stats.effectSize} (small)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Power</span>
                      <span className="text-white">{stats.currentPower}%</span>
                    </div>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Performance by Game Type</h3>
                <img 
                  src={`${GITHUB_RAW}/06_game_type.png`} 
                  alt="Performance by Game Type" 
                  className="w-full rounded-lg mb-6"
                />
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-400 border-b border-white/10">
                        <th className="text-left py-3">Game Type</th>
                        <th className="text-right py-3">Sessions</th>
                        <th className="text-right py-3">Total</th>
                        <th className="text-right py-3">Win Rate</th>
                        <th className="text-right py-3">p-value</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      <tr className="border-b border-white/5">
                        <td className="py-3">Poker Soc</td>
                        <td className="text-right">7</td>
                        <td className="text-right text-emerald-400">£90.21</td>
                        <td className="text-right">85.7%</td>
                        <td className="text-right text-yellow-400">0.079*</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-3">Random Home Games</td>
                        <td className="text-right">5</td>
                        <td className="text-right text-emerald-400">£135.60</td>
                        <td className="text-right">60.0%</td>
                        <td className="text-right">0.513</td>
                      </tr>
                      <tr>
                        <td className="py-3">Friend Games</td>
                        <td className="text-right">24</td>
                        <td className="text-right text-emerald-400">£49.05</td>
                        <td className="text-right">45.8%</td>
                        <td className="text-right">0.716</td>
                      </tr>
                    </tbody>
                  </table>
                  <p className="text-xs text-gray-500 mt-2">*Marginally significant at 10% level</p>
                </div>
              </GlassPanel>

              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Drawdown from Peak</h3>
                <img 
                  src={`${GITHUB_RAW}/07_drawdown.png`} 
                  alt="Drawdown from Peak" 
                  className="w-full rounded-lg"
                />
              </GlassPanel>
            </div>
          )}

          {activeTab === 'frequentist' && (
            <div className="space-y-6">
              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Hypothesis Testing (ST202 Ch. 8)</h3>
                <p className="text-gray-400 mb-4">Testing H₀: μ = 0 vs H₁: μ ≠ 0 using a one-sample t-test.</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    I'm testing whether my average profit is genuinely different from zero, or just due to luck. The t-test asks: "If I had no real edge, how likely would I see these results?" A p-value below 0.05 would mean less than 5% chance it's just luck.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">t-statistic</span>
                    <span className="text-white">1.21</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">p-value</span>
                    <span className="text-yellow-400">0.23 (not significant at α = 0.05)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">95% Confidence Interval</span>
                    <span className="text-white">[£-4.42, £20.28]</span>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Likelihood Ratio Test (ST202 Ch. 9.4)</h3>
                <p className="text-gray-400 mb-4">Testing μ = 0 using Wilks theorem.</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    This is another way to test if my edge is real. It compares how well the data fits "I have no edge" versus "I have some edge". The closer the p-value to 0, the more evidence I have an edge. At 0.22, it's not conclusive yet.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">-2log(Λ)</span>
                    <span className="text-white">1.48</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">p-value</span>
                    <span className="text-yellow-400">0.22</span>
                  </div>
                </div>
              </GlassPanel>

              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Maximum Likelihood Estimation (ST202 Ch. 9.3)</h3>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-300">
                    MLE finds the most likely values for my true average profit and variance based on my data. I compared two models: Normal (assumes typical bell curve) vs Student-t (allows for occasional big swings). The Student-t fits better because poker has those rare huge wins/losses.
                  </p>
                </div>
                <p className="text-gray-400 mb-4">Fitted Normal and Student t distributions. Model comparison via AIC/BIC.</p>
                <img 
                  src={`${GITHUB_RAW}/03_distribution_mle.png`} 
                  alt="Profit Distribution with MLE Fits" 
                  className="w-full rounded-lg mb-4"
                />
                <p className="text-blue-400">Result: Student-t preferred (accounts for heavy tails from occasional large wins/losses)</p>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'bayesian' && (
            <div className="space-y-6">
              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Bayesian Analysis</h3>
                <p className="text-gray-400 mb-4">Using a conjugate Normal-Normal model with prior sensitivity analysis.</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    Instead of asking "is my edge real?", Bayesian analysis asks "what's the probability my edge is positive?" I start with different assumptions (priors) about my skill level - skeptical (assume I'm average), neutral, or optimistic. Then I update these beliefs with my actual results to get a posterior probability. The key insight: even starting skeptical, the data suggests ~88% chance I have a genuine edge.
                  </p>
                </div>
                <img 
                  src={`${GITHUB_RAW}/08_bayesian.png`} 
                  alt="Bayesian Posterior Distributions" 
                  className="w-full rounded-lg mb-6"
                />
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Skeptical</span>
                      <span className="text-gray-500 text-sm ml-2">Prior: N(0, 20²)</span>
                    </div>
                    <div className="text-sm mt-2 md:mt-0">
                      <span className="text-gray-400">Posterior: N(6.9, 6.0²)</span>
                      <span className="text-emerald-400 ml-4">P(positive edge) = 87.5%</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Neutral</span>
                      <span className="text-gray-500 text-sm ml-2">Prior: N(0, 50²)</span>
                    </div>
                    <div className="text-sm mt-2 md:mt-0">
                      <span className="text-gray-400">Posterior: N(7.5, 6.2²)</span>
                      <span className="text-emerald-400 ml-4">P(positive edge) = 88.6%</span>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Optimistic</span>
                      <span className="text-gray-500 text-sm ml-2">Prior: N(10, 30²)</span>
                    </div>
                    <div className="text-sm mt-2 md:mt-0">
                      <span className="text-gray-400">Posterior: N(7.7, 6.2²)</span>
                      <span className="text-emerald-400 ml-4">P(positive edge) = 89.2%</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 mt-6 text-sm">
                  All three priors converge to approximately 88-90% probability of a positive edge, demonstrating robustness to prior specification.
                </p>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'bootstrap' && (
            <div className="space-y-6">
              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Bootstrap Inference</h3>
                <p className="text-gray-400 mb-4">Non-parametric bootstrap with B = 10,000 resamples provides distribution-free inference.</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    Bootstrap is like asking "what if I played these same sessions in different orders?" I randomly resample my 36 sessions 10,000 times and calculate the average each time. This shows me the range of outcomes I might expect. 88.6% of these resampled averages were positive, suggesting my edge is likely real.
                  </p>
                </div>
                <img 
                  src={`${GITHUB_RAW}/04_bootstrap.png`} 
                  alt="Bootstrap Distribution of Mean" 
                  className="w-full rounded-lg mb-6"
                />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Bootstrap 95% CI</span>
                    <span className="text-white">[£-4.42, £20.28]</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Bootstrap SE</span>
                    <span className="text-white">£6.31</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">P(mean positive)</span>
                    <span className="text-emerald-400">88.6%</span>
                  </div>
                </div>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'power' && (
            <div className="space-y-6">
              <GlassPanel className="p-8">
                <h3 className="text-xl font-semibold text-white mb-4">Power Analysis</h3>
                <p className="text-gray-400 mb-4">With a small effect size (d = 0.202), many more sessions are needed to detect a true edge.</p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-300">
                    Power analysis answers "do I have enough data to prove my edge?" My edge is small (~£7.64/session) relative to the variance (~£37.79), making it hard to detect statistically. With only 36 sessions, I have just 21.8% power - meaning even if I have a real edge, there's only a 21.8% chance my test would detect it. I'd need 195 sessions for 80% power (the standard threshold).
                  </p>
                </div>
                <img 
                  src={`${GITHUB_RAW}/05_power_curve.png`} 
                  alt="Power Curve" 
                  className="w-full rounded-lg mb-6"
                />
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Current Power</span>
                    <span className="text-yellow-400">{stats.currentPower}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Effect Size (Cohen d)</span>
                    <span className="text-white">{stats.effectSize} (small)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Sessions for 80% Power</span>
                    <span className="text-blue-400">{stats.sessionsFor80Power}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Additional Sessions Needed</span>
                    <span className="text-white">{stats.sessionsFor80Power - stats.totalSessions}</span>
                  </div>
                </div>
              </GlassPanel>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <RawDataSection />
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <GlassPanel className="p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Course Context</h3>
            <p className="text-gray-400 mb-4">
              This project applies concepts from <span className="text-blue-400">ST202 - Probability and Statistical Inference</span> at LSE:
            </p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                Chapter 8: Estimation, Testing, and Prediction
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                Chapter 9: Likelihood-based Inference
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500">→</span>
                Textbook: Mavrakakis and Penzer, Probability and Statistical Inference
              </li>
            </ul>
          </GlassPanel>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">Last updated: February 2026</div>
          <a 
            href="https://github.com/Aanu30/pokeranalysis" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            View full code and data on GitHub →
          </a>
        </div>
      </footer>
    </div>
  );
}
