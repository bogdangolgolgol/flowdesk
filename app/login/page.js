'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handle = async () => {
    setLoading(true); setError(''); setMessage('')
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/'
      }
    } catch (e) { setError(e.message) }
    setLoading(false)
  }

  const inp = {width:'100%',padding:'10px 14px',border:'1.5px solid rgba(0,0,0,0.13)',borderRadius:'9px',fontSize:'14px',fontFamily:'DM Sans,sans-serif',outline:'none',background:'#f8f8fa',color:'#111118'}
  const btn = {width:'100%',padding:'11px',background:'#6c5ce7',color:'#fff',border:'none',borderRadius:'9px',fontSize:'14px',fontWeight:'600',fontFamily:'DM Sans,sans-serif',cursor:'pointer'}

  return (
    <div style={{minHeight:'100vh',background:'#f8f8fa',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'DM Sans,sans-serif'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{background:'#fff',border:'1px solid rgba(0,0,0,0.08)',borderRadius:'18px',padding:'36px',width:'400px',maxWidth:'92vw',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'28px'}}>
          <div style={{width:'32px',height:'32px',background:'#6c5ce7',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px'}}>⚡</div>
          <div style={{fontSize:'20px',fontWeight:'700',color:'#111118'}}>FlowDesk</div>
        </div>
        <div style={{fontSize:'22px',fontWeight:'700',color:'#111118',marginBottom:'6px'}}>{isSignup?'Create account':'Welcome back'}</div>
        <div style={{fontSize:'13px',color:'#9090a8',marginBottom:'24px'}}>{isSignup?'Start your 7-day free trial':'Sign in to your account'}</div>
        <div style={{marginBottom:'14px'}}>
          <label style={{fontSize:'12px',color:'#9090a8',fontWeight:'500',display:'block',marginBottom:'6px'}}>Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={{fontSize:'12px',color:'#9090a8',fontWeight:'500',display:'block',marginBottom:'6px'}}>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handle()} style={inp}/>
        </div>
        {error&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',color:'#dc2626',marginBottom:'14px'}}>{error}</div>}
        {message&&<div style={{background:'rgba(108,92,231,0.08)',border:'1px solid rgba(108,92,231,0.2)',borderRadius:'8px',padding:'10px 14px',fontSize:'13px',color:'#6c5ce7',marginBottom:'14px'}}>{message}</div>}
        <button onClick={handle} disabled={loading} style={btn}>{loading?'Loading...':isSignup?'Create account':'Sign in'}</button>
        <div style={{textAlign:'center',marginTop:'18px',fontSize:'13px',color:'#9090a8'}}>
          {isSignup?"Already have an account? ":"Don't have an account? "}
          <span style={{color:'#6c5ce7',cursor:'pointer',fontWeight:'500'}} onClick={()=>{setIsSignup(!isSignup);setError('');setMessage('')}}>{isSignup?'Sign in':'Sign up free'}</span>
        </div>
      </div>
    </div>
  )
}
