import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { env } from '../config/env';
import { useApp } from '../context/AppContext';

export default function Login() {
  const nav = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [requestId, setRequestId] = useState(null);
  const [busy, setBusy] = useState(false);
  const refs = useRef([]);
  const { sendOtp, verifyOtp, loginAsGuest } = useApp();

  const withBusy = async (fn) => {
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  };

  const requestOtp = () =>
    withBusy(async () => {
      const res = await sendOtp(phone);
      if (res) {
        setRequestId(res.requestId);
        setStep('otp');
      }
    });

  const verify = () =>
    withBusy(async () => {
      if (await verifyOtp({ phone, otp: otp.join(''), requestId })) nav('/home', { replace: true });
    });

  const guest = () =>
    withBusy(async () => {
      if (await loginAsGuest()) nav('/home', { replace: true });
    });

  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 3) refs.current[i + 1]?.focus();
  };

  return (
    <div className="screen login anim-fade">
      <div className="login-hero">
        <div className="login-chips">
          <span>🎡</span>
          <span>🎟️</span>
          <span>🎰</span>
          <span>🎫</span>
        </div>
        <h1>
          Welcome to <span className="gold-text">LuckyCoin</span>
        </h1>
        <p className="muted">
          Get <b className="gold-text">500 coins</b> welcome bonus on sign up!
        </p>
      </div>

      <div className="login-card glass">
        {step === 'phone' ? (
          <>
            <label className="field-label">Mobile number</label>
            <div className="phone-field">
              <span>🇮🇳 +91</span>
              <input
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button className="btn btn-gold btn-lg btn-block" disabled={phone.length < 10 || busy} onClick={requestOtp}>
              {busy ? <span className="spinner" /> : 'GET OTP'}
            </button>
            {env.useMock && <p className="tiny muted center">Demo mode — enter any 10 digits</p>}
          </>
        ) : (
          <>
            <label className="field-label">Enter the OTP sent to +91 {phone}</label>
            <div className="otp-row">
              {otp.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  inputMode="numeric"
                  className="otp-box"
                  value={d}
                  autoFocus={i === 0}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => e.key === 'Backspace' && !d && i > 0 && refs.current[i - 1]?.focus()}
                />
              ))}
            </div>
            <button className="btn btn-gold btn-lg btn-block" disabled={otp.join('').length < 4 || busy} onClick={verify}>
              {busy ? <span className="spinner" /> : 'VERIFY & PLAY'}
            </button>
            {env.useMock && <p className="tiny muted center">Demo mode — any 4 digits work</p>}
            <button className="link-btn center-block" onClick={() => setStep('phone')}>
              Change number
            </button>
          </>
        )}
      </div>

      <button className="link-btn center-block" disabled={busy} onClick={guest}>
        Continue as guest ›
      </button>
      <p className="tiny muted center login-legal">18+ only. Play responsibly. By continuing you agree to our Terms &amp; Privacy Policy.</p>
    </div>
  );
}
