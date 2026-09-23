'use client';

import { useId, useState } from 'react';
import { CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, passwordRules } from '@/shared/password-policy';

export function PasswordField({ name, label, newPassword = false }: { name: string; label: string; newPassword?: boolean }) {
  const id = useId();
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  return <div className="password-field">
    <label htmlFor={id}>{label}</label>
    <div className="password-input-wrap">
      <input id={id} name={name} type={visible ? 'text' : 'password'} value={value}
        onChange={event => setValue(event.target.value)}
        minLength={newPassword ? PASSWORD_MIN_LENGTH : 1} maxLength={PASSWORD_MAX_LENGTH}
        autoComplete={newPassword ? 'new-password' : 'current-password'} required
        aria-describedby={newPassword ? `${id}-requirements` : undefined}
        placeholder={newPassword ? 'Şifreni oluştur' : 'Şifreni gir'}/>
      <button type="button" className="password-toggle" aria-label={visible ? 'Şifreyi gizle' : 'Şifreyi göster'}
        aria-pressed={visible} aria-controls={id} onClick={() => setVisible(!visible)}>
        {visible ? <EyeOff size={19} aria-hidden="true"/> : <Eye size={19} aria-hidden="true"/>}
      </button>
    </div>
    {newPassword && <ul id={`${id}-requirements`} className="password-requirements" aria-label="Şifre gereksinimleri">
      {passwordRules.map(rule => {
        const met = rule.test(value);
        return <li key={rule.id} className={met ? 'is-met' : ''}>
          {met ? <CheckCircle2 size={16} aria-hidden="true"/> : <Circle size={16} aria-hidden="true"/>}
          <span>{rule.label}<span className="sr-only">{met ? ': karşılandı' : ': henüz karşılanmadı'}</span></span>
        </li>;
      })}
    </ul>}
  </div>;
}
