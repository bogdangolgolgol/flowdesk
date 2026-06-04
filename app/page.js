'use client'
import { useState, useEffect, useRef } from 'react'
import styles from './page.module.css'
import { translations } from './i18n'
import { supabase } from './lib/supabase'

const DEMO_TASKS = [
  { id:1, name:'Review brand guidelines', project_name:'Acme Corp', category:'Design', priority:'high', duration:'45m', done:true },
  { id:2, name:'Client call prep', project_name:'TechStartup', category:'Sales', priority:'med', duration:'30m', done:true },
  { id:3, name:'Update project docs', project_name:'Internal', category:'Admin', priority:'low', duration:'20m', done:true },
  { id:4, name:'Homepage redesign', project_name:'Acme Corp', category:'Dev', priority:'high', duration:'3h', done:false },
  { id:5, name:'Write weekly report', project_name:'Internal', category:'Admin', priority:'low', duration:'1h', done:false },
  { id:6, name:'Fix payment bug', project_name:'SaaS Client', category:'Dev', priority:'high', duration:'2h', done:false },
  { id:7, name:'Design logo variants', project_name:'TechStartup', category:'Design', priority:'med', duration:'2.5h', done:false },
]

export default function Home() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [view, setView] = useState('dashboard')
  const [tasks, setTasks] = useState(DEMO_TASKS)
  const [taskFilter, setTaskFilter] = useState('all')
  const [timerSec, setTimerSec] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [trackerSec, setTrackerSec] = useState(0)
  const [trackerRunning, setTrackerRunning] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiPlan, setAiPlan] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [showNewTask, setShowNewTask] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskProject, setNewTaskProject] = useState('Acme Corp')
  const [newTaskPriority, setNewTaskPriority] = useState('high')
  const [newTaskDuration, setNewTaskDuration] = useState('')
  const [lang, setLang] = useState('en')
  const [theme, setTheme] = useState('light')
  const timerRef = useRef(null)
  const trackerRef = useRef(null)

  const t = translations[lang]

  useEffect(() => {
    const saved = localStorage.getItem('fd-theme') || 'light'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved === 'dark' ? 'dark' : '')
    const savedLang = localStorage.getItem('fd-lang') || 'en'
    setLang(savedLang)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
      if (session?.user) loadTasks(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadTasks(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadTasks = async (userId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, projects(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error && data && data.length > 0) {
      setTasks(data.map(t => ({ ...t, project_name: t.projects?.name || 'Personal' })))
    }
  }

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '')
    localStorage.setItem('fd-theme', next)
  }

  const changeLang = (l) => { setLang(l); localStorage.setItem('fd-lang', l) }

  const fmt = (s) => {
    const h = String(Math.floor(s/3600)).padStart(2,'0')
    const m = String(Math.floor((s%3600)/60)).padStart(2,'0')
    const sec = String(s%60).padStart(2,'0')
    return `${h}:${m}:${sec}`
  }

  useEffect(() => {
    if (timerRunning) { timerRef.current = setInterval(() => setTimerSec(s => s+1), 1000) }
    else clearInterval(timerRef.current)
    return () => clearInterval(timerRef.current)
  }, [timerRunning])

  useEffect(() => {
    if (trackerRunning) { trackerRef.current = setInterval(() => setTrackerSec(s => s+1), 1000) }
    else clearInterval(trackerRef.current)
    return () => clearInterval(trackerRef.current)
  }, [trackerRunning])

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id)
    const newDone = !task.done
    setTasks(ts => ts.map(t => t.id===id ? {...t, done:newDone} : t))
    if (user) {
      await supabase.from('tasks').update({ done: newDone }).eq('id', id)
    }
  }

  const pendingCount = tasks.filter(t => !t.done).length
  const doneCount = tasks.filter(t => t.done).length
  const filteredTasks = tasks.filter(t => taskFilter==='todo' ? !t.done : taskFilter==='done' ? t.done : true)

  const generatePlan = async (quickMode) => {
    const prompt = quickMode
      ? 'I have 4 tasks today: Homepage redesign (3h, urgent deadline Jun 1), fix payment bug (2h, high priority), write weekly report (1h), design logo variants (2.5h). I work best in the morning. No fixed meetings today.'
      : aiPrompt
    if (!prompt.trim()) return
    if (quickMode) setAiPrompt(prompt)
    setAiLoading(true); setAiPlan(null)
    try {
      const res = await fetch('/api/ai-plan', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      setAiPlan(data.blocks)
    } catch {
      setAiPlan([
        { time:'09:00', task:'Homepage redesign', client:'Acme Corp', duration:'3h', note:'Peak focus time' },
        { time:'12:00', task:'Lunch break', client:'', duration:'1h', note:'Rest & recharge' },
        { time:'13:00', task:'Fix payment bug', client:'SaaS Client', duration:'2h', note:'High priority' },
        { time:'15:00', task:'Design logo variants', client:'TechStartup', duration:'1.5h', note:'' },
        { time:'16:30', task:'Write weekly report', client:'Internal', duration:'1h', note:'End of day wrap-up' },
      ])
    }
    setAiLoading(false)
  }

  const addTask = async () => {
    if (!newTaskName.trim()) return
    const newTask = { id:Date.now(), name:newTaskName, project_name:newTaskProject, category:'General', priority:newTaskPriority, duration:newTaskDuration||'1h', done:false }
    setTasks(ts => [...ts, newTask])
    if (user) {
      await supabase.from('tasks').insert({
        user_id: user.id, name: newTaskName, priority: newTaskPriority, duration: newTaskDuration||'1h', done: false
      })
      loadTasks(user.id)
    }
    setNewTaskName(''); setNewTaskDuration(''); setShowNewTask(false)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTasks(DEMO_TASKS)
  }

  if (authLoading) return (
    <div style={{height:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--bg)',fontFamily:'DM Sans,sans-serif',color:'var(--text3)'}}>
      <div>Loading FlowDesk...</div>
    </div>
  )

  const navItems = [
    { id:'dashboard', icon:'⊡', label:t.dashboard },
    { id:'tasks', icon:'☑', label:t.tasks, badge:pendingCount },
    { id:'ai-plan', icon:'✦', label:t.aiDayPlan },
    { id:'tracker', icon:'◷', label:t.timeTracker },
    { id:'projects', icon:'◈', label:t.projects },
    { id:'deadlines', icon:'◎', label:t.deadlines },
  ]

  const pageTitles = {
    dashboard: [t.dashboard, `${t.greet}, ${user?.email?.split('@')[0] || 'Bogdan'} 👋`],
    tasks: [t.tasks, ''],
    'ai-plan': [t.aiDayPlan, ''],
    tracker: [t.timeTracker, ''],
    projects: [t.projects, ''],
    deadlines: [t.deadlines, ''],
  }

  return (
    <div className={styles.app}>
      <nav className={styles.sidebar}>
        <div className={styles.logoArea}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>⚡</div>
            FlowDesk
          </div>
          <button className={styles.themeToggle} onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>{t.overview}</div>
          {navItems.slice(0,3).map(item => (
            <button key={item.id} className={`${styles.navItem} ${view===item.id ? styles.active : ''}`} onClick={() => setView(item.id)}>
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
              {item.badge > 0 && <span className={styles.badge}>{item.badge}</span>}
            </button>
          ))}
          <div className={styles.navLabel}>{t.work}</div>
          {navItems.slice(3).map(item => (
            <button key={item.id} className={`${styles.navItem} ${view===item.id ? styles.active : ''}`} onClick={() => setView(item.id)}>
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.sidebarBottom}>
          <div className={styles.langSelector}>
            {['en','sr','de'].map(l => (
              <button key={l} className={`${styles.langBtn} ${lang===l ? styles.active : ''}`} onClick={() => changeLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className={styles.userArea}>
            <div className={styles.avatar}>{user ? user.email[0].toUpperCase() : 'B'}</div>
            <div style={{flex:1,minWidth:0}}>
              <div className={styles.userName} style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {user ? user.email.split('@')[0] : 'Bogdan'}
              </div>
              <div className={styles.userPlan}>{t.freePlan}</div>
            </div>
            {user && (
              <button onClick={signOut} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:'16px',flexShrink:0}} title="Sign out">↩</button>
            )}
          </div>
          {!user && (
            <a href="/login" style={{display:'block',marginTop:'10px',textAlign:'center',padding:'8px',background:'var(--accent)',color:'#fff',borderRadius:'9px',fontSize:'13px',fontWeight:'600',textDecoration:'none'}}>
              Sign in / Sign up
            </a>
          )}
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.topbar}>
          <div>
            <div className={styles.pageTitle}>{pageTitles[view][0]}</div>
            {pageTitles[view][1] && <div className={styles.pageSubtitle}>{pageTitles[view][1]}</div>}
          </div>
          <div className={styles.topbarActions}>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowNewTask(true)}>{t.newTask}</button>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setView('ai-plan')}>{t.aiPlan}</button>
          </div>
        </div>

        <div className={styles.content}>

          {view === 'dashboard' && (
            <>
              <div className={styles.metrics}>
                {[
                  { label:t.todayHours, value:'4h 23m', color:'var(--accent)', sub:<><span className={styles.metricUp}>↑ 12%</span> {t.vsYesterday}</> },
                  { label:t.tasksDone, value:`${doneCount}/${tasks.length}`, color:'var(--green)', sub:`${pendingCount} ${t.remaining}` },
                  { label:t.activeProjects, value:'5', color:'var(--text)', sub:`2 ${t.deadlinesThisWeek}` },
                  { label:t.deadlinesLabel, value:'2', color:'var(--red)', sub:t.urgentThisWeek },
                ].map((m,i) => (
                  <div key={i} className={styles.metricCard}>
                    <div className={styles.metricLabel}>{m.label}</div>
                    <div className={styles.metricValue} style={{color:m.color}}>{m.value}</div>
                    <div className={styles.metricSub}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <div className={styles.grid3}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>{t.todaysTasks}</div>
                    <div className={styles.cardAction} onClick={() => setView('tasks')}>{t.seeAll}</div>
                  </div>
                  {tasks.slice(0,5).map(task => (
                    <div key={task.id} className={styles.taskItem} onClick={() => toggleTask(task.id)}>
                      <div className={`${styles.taskCheck} ${task.done ? styles.done : ''}`}>{task.done && '✓'}</div>
                      <div className={styles.taskInfo}>
                        <div className={`${styles.taskName} ${task.done ? styles.striked : ''}`}>{task.name}</div>
                        <div className={styles.taskMeta}>{task.project_name} · {task.category}</div>
                      </div>
                      <div className={`${styles.priorityDot} ${styles['p_'+task.priority]}`}></div>
                      <div className={styles.timeBadge}>{task.duration}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>{t.quickTimer}</div>
                      <div style={{fontSize:'11px',fontWeight:600,color: timerRunning ? 'var(--green)' : timerSec > 0 ? 'var(--amber)' : 'var(--text3)'}}>
                        {timerRunning ? t.running : timerSec > 0 ? t.paused : t.stopped}
                      </div>
                    </div>
                    <div className={styles.timerDisplay}>
                      <div className={styles.timerTime}>{fmt(timerSec)}</div>
                      <div className={styles.timerProject}>Homepage redesign · Acme Corp</div>
                    </div>
                    <div className={styles.timerControls}>
                      <button className={styles.btnCircle} onClick={() => { setTimerRunning(false); setTimerSec(0); }}>↺</button>
                      <button className={`${styles.btnCircle} ${styles.play} ${timerRunning ? styles.timerActive : ''}`} onClick={() => setTimerRunning(r => !r)}>
                        {timerRunning ? '⏸' : '▶'}
                      </button>
                      <button className={styles.btnCircle} onClick={() => setView('tracker')}>⊞</button>
                    </div>
                  </div>
                  <div className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardTitle}>{t.nextDeadline}</div>
                      <div className={styles.cardAction} onClick={() => setView('deadlines')}>{t.all}</div>
                    </div>
                    {[
                      { icon:'🔥', cls:'urgent', name:'Homepage Redesign', date:'Jun 1 · Acme Corp', badge:'3 '+t.days },
                      { icon:'⚡', cls:'soon', name:'Payment Bug Fix', date:'Jun 5 · SaaS Client', badge:'7 '+t.days },
                    ].map((d,i) => (
                      <div key={i} className={styles.deadlineItem}>
                        <div className={`${styles.deadlineIcon} ${styles['dl_'+d.cls]}`}>{d.icon}</div>
                        <div className={styles.deadlineInfo}>
                          <div className={styles.deadlineName}>{d.name}</div>
                          <div className={styles.deadlineDate}>{d.date}</div>
                        </div>
                        <div className={`${styles.deadlineBadge} ${styles['db_'+d.cls]}`}>{d.badge}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {view === 'tasks' && (
            <>
              <div className={styles.tabs}>
                {[['all',t.allTasks],['todo',t.toDo],['done',t.done]].map(([f,label]) => (
                  <button key={f} className={`${styles.tab} ${taskFilter===f ? styles.active : ''}`} onClick={() => setTaskFilter(f)}>{label}</button>
                ))}
              </div>
              <div className={styles.card}>
                {filteredTasks.map(task => (
                  <div key={task.id} className={styles.taskItem} onClick={() => toggleTask(task.id)}>
                    <div className={`${styles.taskCheck} ${task.done ? styles.done : ''}`}>{task.done && '✓'}</div>
                    <div className={styles.taskInfo}>
                      <div className={`${styles.taskName} ${task.done ? styles.striked : ''}`}>{task.name}</div>
                      <div className={styles.taskMeta}>{task.project_name} · {task.category} · {task.duration}</div>
                    </div>
                    <div className={`${styles.priorityDot} ${styles['p_'+task.priority]}`}></div>
                    <div className={styles.timeBadge}>{task.duration}</div>
                  </div>
                ))}
                {filteredTasks.length === 0 && (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>✓</div>
                    <div className={styles.emptyText}>{t.noTasks}</div>
                  </div>
                )}
              </div>
            </>
          )}

          {view === 'ai-plan' && (
            <>
              <div className={styles.card} style={{marginBottom:'16px'}}>
                <div className={styles.cardHeader}><div className={styles.cardTitle}>{t.aiScheduleGenerator}</div></div>
                <p style={{fontSize:'13px',color:'var(--text3)',marginBottom:'14px'}}>{t.aiDescription}</p>
                <textarea className={styles.formInput} rows={3} placeholder={t.aiPlaceholder} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} style={{resize:'vertical'}} />
                <div style={{marginTop:'12px',display:'flex',gap:'10px'}}>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} style={{flex:1}} onClick={() => generatePlan(false)}>{t.generatePlan}</button>
                  <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => generatePlan(true)}>{t.quickPlan}</button>
                </div>
                {aiLoading && <div className={styles.loading}><div className={styles.spinner}></div>{t.aiLoading}</div>}
              </div>
              {aiPlan && (
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>{t.todaysSchedule}</div>
                    <div className={styles.cardAction} onClick={() => generatePlan(false)}>{t.regenerate}</div>
                  </div>
                  {aiPlan.map((b,i) => (
                    <div key={i} className={styles.aiPlanItem}>
                      <div className={styles.timeSlot}>{b.time}</div>
                      <div className={styles.planTask}>
                        <div className={styles.planTaskName}>{b.task}</div>
                        <div className={styles.planTaskClient}>{b.client}{b.note ? ' · '+b.note : ''}</div>
                      </div>
                      <div className={styles.planDur}>{b.duration}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {view === 'tracker' && (
            <>
              <div className={styles.grid2} style={{marginBottom:'16px'}}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>{t.activeTimer}</div>
                    <div style={{fontSize:'11px',fontWeight:600,padding:'3px 10px',background: trackerRunning ? 'var(--green-bg)' : 'var(--red-bg)',color: trackerRunning ? 'var(--green)' : 'var(--red)',borderRadius:'20px'}}>
                      {trackerRunning ? t.running : t.stopped}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t.project}</label>
                    <select className={styles.formInput}><option>Acme Corp</option><option>SaaS Client</option><option>TechStartup</option></select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t.whatWorking}</label>
                    <input className={styles.formInput} type="text" placeholder={t.whatWorking} />
                  </div>
                  <div className={styles.timerDisplay}><div className={styles.timerTime}>{fmt(trackerSec)}</div></div>
                  <div className={styles.timerControls}>
                    <button className={styles.btnCircle} onClick={() => { setTrackerRunning(false); setTrackerSec(0); }}>↺</button>
                    <button className={`${styles.btnCircle} ${styles.play} ${trackerRunning ? styles.timerActive : ''}`} onClick={() => setTrackerRunning(r => !r)}>
                      {trackerRunning ? '⏸' : '▶'}
                    </button>
                    <button className={styles.btnCircle}>✓</button>
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardHeader}><div className={styles.cardTitle}>{t.timeByProject}</div></div>
                  {[
                    { name:'Acme Corp', hrs:'12.5h', pct:78, color:'var(--accent)' },
                    { name:'SaaS Client', hrs:'8.0h', pct:50, color:'var(--blue)' },
                    { name:'TechStartup', hrs:'5.5h', pct:34, color:'var(--green)' },
                    { name:'Internal', hrs:'2.0h', pct:12, color:'var(--amber)' },
                  ].map((p,i) => (
                    <div key={i} className={styles.projectBar}>
                      <div className={styles.projectBarHeader}>
                        <div className={styles.projectBarName}>{p.name}</div>
                        <div className={styles.projectBarHrs}>{p.hrs}</div>
                      </div>
                      <div className={styles.barTrack}><div className={styles.barFill} style={{width:`${p.pct}%`,background:p.color}}></div></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardHeader}><div className={styles.cardTitle}>{t.recentEntries}</div></div>
                {[
                  { color:'var(--accent)', name:'Homepage redesign', client:'Acme Corp', time:'Today 09:00–11:30', dur:'2h 30m' },
                  { color:'var(--blue)', name:'Fix payment bug', client:'SaaS Client', time:'Today 11:45–13:00', dur:'1h 15m' },
                  { color:'var(--green)', name:'Logo variants', client:'TechStartup', time:'Yesterday 14:00–16:30', dur:'2h 30m' },
                ].map((e,i) => (
                  <div key={i} className={styles.taskItem}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:e.color,flexShrink:0}}></div>
                    <div className={styles.taskInfo}>
                      <div className={styles.taskName}>{e.name}</div>
                      <div className={styles.taskMeta}>{e.client} · {e.time}</div>
                    </div>
                    <div className={styles.timeBadge}>{e.dur}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {view === 'projects' && (
            <div className={styles.grid2}>
              {[
                { color:'var(--accent)', name:'Acme Corp', desc:'Homepage Redesign + Brand', pct:65, hrs:'12.5h', deadline:'Jun 1', status:'urgent' },
                { color:'var(--blue)', name:'SaaS Client', desc:'Bug fixes + Feature dev', pct:40, hrs:'8.0h', deadline:'Jun 5', status:'urgent' },
                { color:'var(--green)', name:'TechStartup', desc:'Logo + Marketing materials', pct:30, hrs:'5.5h', deadline:'Jun 15', status:'soon' },
              ].map((p,i) => (
                <div key={i} className={styles.card}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
                    <div style={{width:'10px',height:'10px',borderRadius:'50%',background:p.color,flexShrink:0}}></div>
                    <div style={{fontWeight:600,color:'var(--text)',fontSize:'14px'}}>{p.name}</div>
                    <div className={`${styles.deadlineBadge} ${styles['db_'+p.status]}`} style={{marginLeft:'auto'}}>Active</div>
                  </div>
                  <div style={{fontSize:'12px',color:'var(--text3)',marginBottom:'14px'}}>{p.desc}</div>
                  <div className={styles.projectBar}>
                    <div className={styles.projectBarHeader}>
                      <div style={{fontSize:'12px',color:'var(--text3)'}}>{t.progress}</div>
                      <div className={styles.projectBarHrs}>{p.pct}%</div>
                    </div>
                    <div className={styles.barTrack}><div className={styles.barFill} style={{width:`${p.pct}%`,background:p.color}}></div></div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginTop:'12px',fontSize:'12px',color:'var(--text3)'}}>
                    <span>⏱ {p.hrs} {t.logged}</span><span>📅 {p.deadline}</span>
                  </div>
                </div>
              ))}
              <div className={styles.card} style={{border:'1.5px dashed var(--border2)',background:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',minHeight:'160px',boxShadow:'none'}} onClick={() => setShowNewProject(true)}>
                <div style={{textAlign:'center',color:'var(--text3)'}}>
                  <div style={{fontSize:'28px',marginBottom:'8px'}}>+</div>
                  <div style={{fontSize:'13px',fontWeight:500}}>{t.addNewProject}</div>
                </div>
              </div>
            </div>
          )}

          {view === 'deadlines' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>{t.allDeadlines}</div>
                <button className={`${styles.btn} ${styles.btnGhost}`} style={{fontSize:'12px',padding:'5px 12px'}} onClick={() => setShowNewTask(true)}>{t.addDeadline}</button>
              </div>
              {[
                { icon:'🔥', cls:'urgent', name:'Homepage Redesign', date:'Jun 1, 2025 · Acme Corp', badge:'3 '+t.days },
                { icon:'⚡', cls:'soon', name:'Payment Bug Fix', date:'Jun 5, 2025 · SaaS Client', badge:'7 '+t.days },
                { icon:'📋', cls:'soon', name:'Logo Variants Delivery', date:'Jun 15, 2025 · TechStartup', badge:'17 '+t.days },
                { icon:'✅', cls:'ok', name:'Q2 Report', date:'Jun 30, 2025 · Internal', badge:'32 '+t.days },
              ].map((d,i) => (
                <div key={i} className={styles.deadlineItem}>
                  <div className={`${styles.deadlineIcon} ${styles['dl_'+d.cls]}`}>{d.icon}</div>
                  <div className={styles.deadlineInfo}>
                    <div className={styles.deadlineName}>{d.name}</div>
                    <div className={styles.deadlineDate}>{d.date}</div>
                  </div>
                  <div className={`${styles.deadlineBadge} ${styles['db_'+d.cls]}`}>{d.badge}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {showNewTask && (
        <div className={styles.modalOverlay} onClick={e => e.target===e.currentTarget && setShowNewTask(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{t.addTask}</div>
              <button className={styles.modalClose} onClick={() => setShowNewTask(false)}>×</button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t.taskName}</label>
              <input className={styles.formInput} type="text" placeholder={t.taskPlaceholder} value={newTaskName} onChange={e => setNewTaskName(e.target.value)} autoFocus />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t.project}</label>
                <select className={styles.formInput} value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)}>
                  <option>Acme Corp</option><option>SaaS Client</option><option>TechStartup</option><option>Internal</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t.priority}</label>
                <select className={styles.formInput} value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}>
                  <option value="high">{t.high}</option><option value="med">{t.medium}</option><option value="low">{t.low}</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t.estDuration}</label>
              <input className={styles.formInput} type="text" placeholder={t.durationPlaceholder} value={newTaskDuration} onChange={e => setNewTaskDuration(e.target.value)} />
            </div>
            <div className={styles.apiNote}>{t.aiEstimate}</div>
            <div style={{display:'flex',gap:'10px'}}>
              <button className={`${styles.btn} ${styles.btnGhost}`} style={{flex:1}} onClick={() => setShowNewTask(false)}>{t.cancel}</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{flex:2}} onClick={addTask}>{t.add}</button>
            </div>
          </div>
        </div>
      )}

      {showNewProject && (
        <div className={styles.modalOverlay} onClick={e => e.target===e.currentTarget && setShowNewProject(false)}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{t.addNewProject}</div>
              <button className={styles.modalClose} onClick={() => setShowNewProject(false)}>×</button>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t.clientProject}</label>
              <input className={styles.formInput} type="text" placeholder={t.clientPlaceholder} autoFocus />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{t.description}</label>
              <input className={styles.formInput} type="text" placeholder={t.descPlaceholder} />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t.startDate}</label>
                <input className={styles.formInput} type="date" />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t.deadline}</label>
                <input className={styles.formInput} type="date" />
              </div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
              <button className={`${styles.btn} ${styles.btnGhost}`} style={{flex:1}} onClick={() => setShowNewProject(false)}>{t.cancel}</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} style={{flex:2}} onClick={() => setShowNewProject(false)}>{t.createProject}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
