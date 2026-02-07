if (showPoker) {
  document.documentElement.scrollTop = 0;
  return <PokerAnalysis onBack={() => setShowPoker(false)} />;
}import { useState, useEffect, useRef } from 'react';
import PokerAnalysis from './PokerAnalysis';

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

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

const SectionLabel = ({ number, title }: { number: string; title: string }) => (
  <div className="mb-8">
    <h3 className="text-2xl md:text-3xl font-semibold tracking-wide text-blue-400" style={{ textShadow: '0 0 20px rgba(59,130,246,0.6), 0 0 40px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.2)' }}>
      {number} <span className="text-white/30 mx-2">/</span> {title}
    </h3>
  </div>
);

const Nav = ({ currentTime }: { currentTime: string }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = ['About', 'Timeline', 'Experience', 'Edge', 'Projects', 'Insights', 'Proof', 'References', 'Contact'];
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <GlassPanel className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => scrollTo('hero')} className="font-bold tracking-tight text-lg text-white hover:text-blue-400 transition-colors" style={{ textShadow: '0 0 10px rgba(59,130,246,0.5)' }}>
            AB
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono bg-white/5 text-gray-400">
            <span>{currentTime}</span>
          </div>
        </div>
        <div className="hidden md:flex gap-4">
          {links.map((link) => (
            <button key={link} onClick={() => scrollTo(link.toLowerCase())} className="text-xs transition-colors text-gray-400 hover:text-white hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
              {link}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-gray-400 hover:text-white">
            {menuOpen ? '✕' : '☰'}
          </button>
          <button onClick={() => scrollTo('contact')} className="text-xs px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white transition-all shadow-lg shadow-blue-500/25">
            Hire Me
          </button>
        </div>
      </GlassPanel>
      {menuOpen && (
        <GlassPanel className="md:hidden max-w-6xl mx-auto mt-2 p-4">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <button key={link} onClick={() => { scrollTo(link.toLowerCase()); setMenuOpen(false); }} className="text-sm text-left text-gray-400 hover:text-white transition-colors py-2 border-b border-white/5">
                {link}
              </button>
            ))}
          </div>
        </GlassPanel>
      )}
    </nav>
  );
};

const Hero = () => (
  <section id="hero" className="min-h-screen flex items-center justify-center px-6 pt-16">
    <div className="max-w-5xl mx-auto text-center">
      <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-sm text-gray-300">Open to Summer 2026 opportunities</span>
      </div>
      <h1 className="text-6xl md:text-8xl font-semibold tracking-tight mb-2 text-white" style={{ textShadow: '0 0 20px rgba(59,130,246,0.5), 0 0 40px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.2)' }}>
        Aarin Bhatt
      </h1>
      <div className="flex items-center justify-center gap-3 mb-6">
        <span className="h-px w-12 bg-blue-500" />
        <span className="text-blue-500 font-semibold tracking-widest text-sm">THE LONDON SCHOOL OF ECONOMICS</span>
        <span className="h-px w-12 bg-blue-500" />
      </div>
      <p className="text-2xl md:text-4xl font-light mb-6 text-blue-400" style={{ textShadow: '0 0 10px rgba(96,165,250,0.5), 0 0 20px rgba(96,165,250,0.3)' }}>
        Turning uncertainty into edge.
      </p>
      <p className="text-xl md:text-2xl font-medium mb-3 text-white">BSc Data Science</p>
      <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-400">Quantitative Trading · Market Microstructure · Probability</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        <button onClick={() => scrollTo('contact')} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
          Get In Touch →
        </button>
        <a href="https://www.linkedin.com/in/aarin-bhatt" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/5">
          LinkedIn
        </a>
        <a href="https://github.com/Aanu30" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 border border-white/20 text-white hover:bg-white/5">
          GitHub
        </a>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {[{ stat: '1st', label: 'Trading Sims' }, { stat: '95%', label: 'A Level Maths' }, { stat: 'Gold', label: 'UKMT' }, { stat: '35+', label: 'Poker Tracked' }].map((item) => (
          <div key={item.label} className="px-4 py-2 rounded-lg bg-white/5">
            <span className="font-bold text-white">{item.stat}</span>
            <span className="text-xs ml-2 text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-wrap justify-center gap-6 text-gray-500">
        {['BlackRock', 'BP', 'Cazenove', 'Schroders', 'PGIM', 'UBS', 'SIG'].map((logo) => (
          <span key={logo} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">{logo}</span>
        ))}
      </div>
    </div>
  </section>
);

const About = () => (
  <section id="about" className="py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <SectionLabel number="01" title="WHO I AM" />
      <h2 className="text-4xl md:text-5xl font-light mb-8 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
        I think in distributions,<br /><span className="text-gray-500">not point estimates.</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <GlassPanel className="p-8">
          <p className="leading-relaxed mb-4 text-gray-400">I enjoy problems that require clear reasoning, disciplined execution and the ability to work with incomplete information. I test ideas in Python, understand how signals behave under noise, and learn from cases where they break.</p>
          <p className="leading-relaxed text-gray-400">Self taught Further Mathematics to A* at a school that did not offer the subject. Calculus gave me speed; probability taught me to think when uncertainty dominates.</p>
        </GlassPanel>
        <GlassPanel className="p-8">
          <p className="leading-relaxed mb-4 text-gray-400">I prefer environments where outcomes depend on reasoning, speed and clear execution. This draws me to quantitative trading, the purest arena for testing ideas against reality.</p>
          <p className="leading-relaxed text-gray-400">Outside academics, I use poker to practise decision making under uncertainty, estimating equity, tracking PnL, staying disciplined after variance.</p>
        </GlassPanel>
      </div>
      <GlassPanel className="p-6">
        <p className="italic text-lg text-center text-gray-400" style={{ textShadow: '0 0 10px rgba(59,130,246,0.3)' }}>"Staying disciplined after variance and thinking in probabilities rather than emotion is the mindset I want to apply directly to quantitative trading."</p>
      </GlassPanel>
    </div>
  </section>
);

const Timeline = () => {
  const events = [
    { date: 'Sep 2025', title: 'LSE Hindu Society', desc: 'Head of Sewa Committee', type: 'leadership' },
    { date: 'Sep 2025', title: 'LSE 93% Club', desc: 'Events Officer', type: 'leadership' },
    { date: 'Nov 2025', title: 'UBS Insight Programme', type: 'experience' },
    { date: 'Jul 2025', title: 'Cazenove Capital Insight Week', desc: '1st place trading simulation', type: 'leadership' },
    { date: 'Apr 2025', title: 'Schroders Spring Week', type: 'experience' },
    { date: 'Apr 2025', title: 'SIG, PIMCO, Allstate Insights', type: 'experience' },
    { date: 'Dec 2024', title: 'LSE Quantitative Society', desc: 'Subcommittee (1 in 13 acceptance rate)', type: 'leadership' },
    { date: 'Nov 2024', title: 'Deloitte Insight Programme', type: 'experience' },
    { date: 'Nov 2024', title: 'LSE Data Science Society', desc: 'Project Lead, built AI marking tools', type: 'leadership' },
    { date: 'Nov 2024', title: 'LSE AI Society', desc: 'Subcommittee, ML research', type: 'leadership' },
    { date: 'Sep 2024', title: 'LSE BSc Data Science', desc: 'Predicted First, 4.3% acceptance rate', type: 'education' },
    { date: 'Aug 2024', title: 'A Levels: A*A*A', desc: 'Maths 95%, Further Maths 85% (self taught)', type: 'education' },
    { date: 'Jul 2024', title: 'BlackRock Technology Intern', desc: 'Built Python tools for Aladdin team', type: 'experience' },
    { date: 'Jul 2024', title: 'PGIM Insight Week', desc: '1st out of 30+ in AmplifyMe trading sim', type: 'leadership' },
    { date: 'Jul 2024', title: 'McKinsey and Bloomberg Insights', type: 'experience' },
    { date: 'Dec 2023', title: 'Bank of England Insight', type: 'experience' },
    { date: 'Oct 2023', title: 'Royal Institution Speaker', desc: 'Selected from 50 candidates for AI speech', type: 'award' },
    { date: 'Oct 2023', title: 'UKMT Senior Kangaroo Merit', desc: 'Top 2% nationally, Best in School', type: 'award' },
    { date: 'Oct 2023', title: 'UKMT Senior Maths Challenge Gold', desc: 'Best in Year', type: 'award' },
    { date: 'Jul 2023', title: 'BP Data Science Intern', desc: 'Built automated data pipelines', type: 'experience' },
    { date: 'Aug 2022', title: 'GCSEs: 99998888', desc: 'Highest in Maths (91%), All A* band', type: 'education' },
  ];
  const getTypeColor = (type: string) => ({ experience: 'bg-blue-500', education: 'bg-emerald-500', award: 'bg-amber-500', leadership: 'bg-violet-500' }[type] || 'bg-gray-500');
  const getTypeTextColor = (type: string) => ({ experience: 'text-blue-500', education: 'text-emerald-500', award: 'text-amber-500', leadership: 'text-violet-500' }[type] || 'text-gray-500');

  return (
    <section id="timeline" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel number="02" title="TIMELINE" />
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
          The Journey<br /><span className="text-gray-500">so far.</span>
        </h2>
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-white/10" />
          {events.map((event, i) => (
            <div key={i} className={`relative flex items-start mb-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'pr-12 text-right' : 'pl-12'}`}>
                <GlassPanel className="p-4 inline-block">
                  <div className={`text-xs font-mono mb-1 ${getTypeTextColor(event.type)}`}>{event.date}</div>
                  <div className="font-medium text-white">{event.title}</div>
                  {event.desc && <div className="text-xs mt-1 text-gray-500">{event.desc}</div>}
                </GlassPanel>
              </div>
              <div className={`absolute left-4 md:left-1/2 w-3 h-3 rounded-full ${getTypeColor(event.type)} -translate-x-1/2 mt-2 ring-4 ring-gray-900`} />
              <div className="md:hidden pl-10">
                <div className={`text-xs font-mono mb-1 ${getTypeTextColor(event.type)}`}>{event.date}</div>
                <div className="font-medium text-white">{event.title}</div>
                {event.desc && <div className="text-xs mt-1 text-gray-500">{event.desc}</div>}
              </div>
              <div className="hidden md:block w-1/2" />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-8">
          {[{ type: 'experience', label: 'Experience' }, { type: 'education', label: 'Education' }, { type: 'award', label: 'Award' }, { type: 'leadership', label: 'Leadership' }].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getTypeColor(item.type)}`} />
              <span className="text-xs capitalize text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Experience = () => {
  const [active, setActive] = useState(0);
  const exps = [
    { company: 'Cazenove Capital', role: 'Insight Week', date: 'Jul 2025', highlights: ['1st place trading simulation', 'Led team presentation on gold vs equities', 'Presented research findings to employees and interns'] },
    { company: 'BlackRock', role: 'Technology Intern (BCBF)', date: 'Jul 2024', highlights: ['Built Python tools (Pandas, NumPy) for Aladdin team', 'Real time monitoring of rate moves and market swings', 'Investment portfolio challenge presentation to seniors'] },
    { company: 'PGIM', role: 'Insight Week', date: 'Jul 2024', highlights: ['Ranked 1st out of 30+ in AmplifyMe trading sim', 'Built productivity app for shift workers in Dragons Den challenge', 'Led winning pitch in final team competition'] },
    { company: 'BP', role: 'Data Science Intern', date: 'Jul to Aug 2023', highlights: ['Built data processing tools in Python', 'Automated pipelines for PDF data extraction', 'Azure and Power BI for visualisation'] },
    { company: 'LSE Data Science Society', role: 'Project Lead', date: 'Nov 2024 to Jan 2025', highlights: ['Led team of 5 developers', 'Built ML model for GCSE students', 'AI marking tools and automated feedback'] },
    { company: 'LSE Quantitative Society', role: 'Subcommittee', date: 'Dec 2024 to Apr 2025', highlights: ['1 in 13 acceptance rate', 'Organised sessions on market microstructure', 'Explored order flow and volatility effects on price'] },
    { company: 'LSE Hindu Society', role: 'Head of Sewa', date: 'Sep 2025 to Present', highlights: ['Leading community service initiatives', 'Organised charity poker night fundraiser', 'Coordinating volunteer programmes'] },
  ];

  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel number="03" title="EXPERIENCE" />
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
          Where I have<br /><span className="text-gray-500">made impact.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            {exps.map((exp, i) => (
              <button key={i} onClick={() => setActive(i)} className={`w-full text-left p-4 rounded-xl transition-all ${active === i ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5'}`}>
                <div className="text-xs font-mono mb-1 text-gray-500">{exp.date}</div>
                <div className={`font-medium ${active === i ? 'text-white' : 'text-gray-400'}`}>{exp.company}</div>
              </button>
            ))}
          </div>
          <GlassPanel className="md:col-span-2 p-8">
            <div className="text-blue-500 font-mono text-sm mb-1">{exps[active].company}</div>
            <h3 className="text-2xl font-light mb-2 text-white">{exps[active].role}</h3>
            <div className="text-sm mb-6 text-gray-500">{exps[active].date}</div>
            <ul className="space-y-3">
              {exps[active].highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="text-blue-500 mt-1">→</span>{h}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};

const Edge = () => {
  const skills = [
    { icon: '🎯', title: 'Decision Making Under Uncertainty', desc: '35+ sessions tracked since October 2024 with net positive ROI. Disciplined PnL logging, bankroll management, and systematic post session review.' },
    { icon: '📊', title: 'Probability Driven Reasoning', desc: 'ST206 Probability Theory. Distributions over point estimates.' },
    { icon: '🏆', title: 'Competitive Trading', desc: '1st in trading simulations at both Cazenove and PGIM (30+ participants).' },
    { icon: '🐍', title: 'Python for Real Problems', desc: 'Data pipelines at BP, real time tools at BlackRock, ML as Project Lead.' },
    { icon: '📈', title: 'Market Intuition', desc: 'ST226 Mathematics for Finance. Microstructure, order flow, signals.' },
    { icon: '⚡', title: 'Speed and Self Teaching', desc: 'Self taught Further Maths to A* (85%). Highest in cohort.' },
  ];

  return (
    <section id="edge" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel number="04" title="THE EDGE" />
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
          What makes me<br /><span className="text-gray-500">different.</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((s) => (
            <GlassPanel key={s.title} className="p-6">
              <div className="text-2xl mb-3">{s.icon}</div>
              <div className="font-medium mb-2 text-white">{s.title}</div>
              <div className="text-sm text-gray-400">{s.desc}</div>
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
};

const Projects = () => {
  const projects = [
    { title: 'Personal Portfolio Website', desc: 'Built from scratch using React and Canvas API. Features animated network graph background, glassmorphism UI, responsive design with mobile navigation, and smooth scroll interactions.', tech: 'React, HTML5 Canvas, Tailwind CSS', link: null, role: null },
    { title: 'LSE Data Science Society AI Tool', desc: 'Led team of 5 developers to build an AI powered marking and feedback system for GCSE students using Azure OpenAI APIs. Delivered personalised learning insights through automated assessment analysis.', tech: 'Python, Azure OpenAI, React', link: null, role: 'Project Lead (Nov 2024 to Jan 2025)' },
    { title: 'Poker Performance Analytics', desc: 'Statistical analysis of 36 poker sessions using hypothesis testing, MLE, Bayesian inference, and bootstrap resampling. 89% probability of positive edge with £275 total profit.', tech: 'Python, NumPy, SciPy, Matplotlib', link: 'https://github.com/Aanu30/pokeranalysis', role: null },
  ];

  return (
    <section id="projects" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel number="05" title="PROJECTS" />
        <h2 className="text-4xl md:text-5xl font-light mb-12 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
          What I have<br /><span className="text-gray-500">built.</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <GlassPanel key={p.title} className="p-6 flex flex-col">
              <div className="text-2xl mb-3">💻</div>
              <div className="font-medium mb-2 text-white">{p.title}</div>
              <div className="text-sm text-gray-400 mb-4 flex-grow">{p.desc}</div>
              {p.role && <div className="text-xs text-violet-400 mb-2">{p.role}</div>}
              <div className="text-xs text-blue-400 mb-3">{p.tech}</div>
              {p.link && (
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-white transition-colors">
                  View on GitHub →
                </a>
              )}
            </GlassPanel>
          ))}
        </div>
      </div>
    </section>
  );
};

const Insights = ({ onPokerClick }: { onPokerClick: () => void }) => {
  const writings = [
    { title: 'Analysing 36 Poker Sessions: What the Data Says About My Edge', date: 'Feb 2026', preview: 'A statistical breakdown of my live poker results using hypothesis testing, MLE, Bayesian inference, and bootstrap resampling. 89% probability of positive edge, but 159 more sessions needed for statistical significance.', tags: ['Poker', 'Statistics', 'ST202'] },
  ];

  return (
    <section id="insights" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <SectionLabel number="06" title="INSIGHTS" />
        <h2 className="text-4xl md:text-5xl font-light mb-4 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
          How I<br /><span className="text-gray-500">think.</span>
        </h2>
        <p className="text-gray-400 mb-12 max-w-2xl">Essays and analysis on probability, markets, and decision making under uncertainty.</p>
        <div className="space-y-6">
          {writings.map((w, i) => (
            <div onClick={onPokerClick} key={i} className="cursor-pointer">
              <GlassPanel className="p-6 hover:bg-white/[0.05] transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-grow">
                    <div className="flex flex-wrap gap-2 mb-3">
                      {w.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">{tag}</span>
                      ))}
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">{w.title}</h3>
                    <p className="text-sm text-gray-400">{w.preview}</p>
                  </div>
                  <div className="text-sm text-gray-500 md:text-right whitespace-nowrap">{w.date}</div>
                </div>
              </GlassPanel>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 italic">More essays coming as I deepen my thinking on these topics.</p>
        </div>
      </div>
    </section>
  );
};

const Proof = () => (
  <section id="proof" className="py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <SectionLabel number="07" title="PROOF" />
      <h2 className="text-4xl md:text-5xl font-light mb-12 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
        Results<br /><span className="text-gray-500">speak.</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { value: '1st', label: 'Trading Simulations', sub: 'Cazenove and PGIM' },
          { value: '95%', label: 'A Level Mathematics', sub: 'Highest in cohort' },
          { value: 'Gold', label: 'UKMT Senior Challenge', sub: 'Top 11%, Best in Year' },
          { value: '2%', label: 'UKMT Kangaroo', sub: 'Top nationally' },
        ].map((s) => (
          <GlassPanel key={s.label} className="p-6 text-center">
            <div className="text-3xl font-bold mb-1 text-white">{s.value}</div>
            <div className="text-sm text-gray-400">{s.label}</div>
            <div className="text-xs mt-1 text-gray-600">{s.sub}</div>
          </GlassPanel>
        ))}
      </div>
      <GlassPanel className="p-6">
        <div className="text-xs uppercase tracking-wider mb-4 text-gray-500">Recognition</div>
        <div className="grid md:grid-cols-2 gap-3">
          {['UKMT Senior Maths Challenge: Gold, Best in Year', 'UKMT Senior Kangaroo: Merit, Best in School, Top 2%', 'MAT 70%, TMUA 6.5: Highest in cohort', 'Royal Institution: Public Speaker (1 in 50)', 'Best Student Award: Physics (1 in 60)', 'LSE Predicted First Class Honours'].map((a) => (
            <div key={a} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-blue-500">◆</span>{a}
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  </section>
);

const References = () => (
  <section id="references" className="py-24 px-6">
    <div className="max-w-5xl mx-auto">
      <SectionLabel number="08" title="REFERENCES" />
      <h2 className="text-4xl md:text-5xl font-light mb-12 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
        What others<br /><span className="text-gray-500">say.</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        <GlassPanel className="p-8">
          <div className="text-sm leading-relaxed mb-6 text-gray-300">"Aarin showed great curiosity by always asking questions to learn about the details. He rapidly powered through online python courses, impressively showing the rate at which he can learn. It was a joy to have him around and I am looking forward to all the great things I am sure he will achieve in the future!"</div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">RD</div>
            <div>
              <div className="font-medium text-white">Ruairi Dunne</div>
              <div className="text-sm text-gray-500">Senior Data Scientist at BP</div>
              <div className="text-xs text-gray-600">Managed Aarin directly</div>
            </div>
          </div>
        </GlassPanel>
        <GlassPanel className="p-8">
          <div className="text-sm leading-relaxed mb-6 text-gray-300">"Aarin is among the most intelligent people I know, particularly when it comes to math. He is extremely dedicated and disciplined when it comes to his work. Aarin takes his aspirations seriously and puts a lot of effort into making sure he is always acting in his best interests. I have no doubt that his dedication will propel him to professional success."</div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">SK</div>
            <div>
              <div className="font-medium text-white">Sam Kaushal</div>
              <div className="text-sm text-gray-500">UCL Statistics, Economics and Finance</div>
              <div className="text-xs text-gray-600">Studied together</div>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  </section>
);

const Contact = () => (
  <section id="contact" className="py-24 px-6">
    <div className="max-w-3xl mx-auto text-center">
      <SectionLabel number="09" title="CONTACT" />
      <h2 className="text-4xl md:text-5xl font-light mb-4 text-white" style={{ textShadow: '0 0 15px rgba(59,130,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}>
        Let's connect!
      </h2>
      <p className="text-lg mb-8 text-gray-400">Recruiting for quant or data science roles? Building something? I'd love to hear from you.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <a href="mailto:a.n.bhatt@lse.ac.uk" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-lg shadow-blue-500/25">
          a.n.bhatt@lse.ac.uk
        </a>
        <a href="https://www.linkedin.com/in/aarin-bhatt" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-medium transition-all border border-white/20 text-white hover:bg-white/5">
          LinkedIn →
        </a>
        <a href="https://github.com/Aanu30" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-medium transition-all border border-white/20 text-white hover:bg-white/5">
          GitHub →
        </a>
      </div>
      <div className="text-sm text-gray-500">London · LSE Data Science · Class of 2027</div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-8 px-6 border-t border-white/5">
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="text-sm text-gray-500">© 2026 Aarin Bhatt</div>
      <div className="text-xs text-gray-600">Turning uncertainty into edge.</div>
    </div>
  </footer>
);

export default function App() {
  const [currentTime, setCurrentTime] = useState('');
  const [showPoker, setShowPoker] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours % 12 || 12}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (showPoker) {
    return <PokerAnalysis onBack={() => setShowPoker(false)} />;
  }

  return (
    <div className="min-h-screen bg-transparent overflow-x-hidden">
      <AnimatedBackground />
      <Nav currentTime={currentTime} />
      <Hero />
      <About />
      <Timeline />
      <Experience />
      <Edge />
      <Projects />
      <Insights onPokerClick={() => { window.scrollTo(0, 0); setShowPoker(true); }} />
      <Proof />
      <References />
      <Contact />
      <Footer />
    </div>
  );
}
