import { useState, type FormEvent } from 'react'
import { contact } from '../data/content'
import { useL } from '../i18n'

type State = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Contact form that emails Emir directly through FormSubmit (no backend,
 * no API key). The very first message triggers a one-time activation email
 * to the inbox; after that, messages arrive normally.
 */
export default function ContactForm() {
  const [state, setState] = useState<State>('idle')
  const { t } = useL()

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())
    if (data._honey) return // a bot filled the hidden field
    setState('sending')
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${contact.email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...data, _subject: `Portfolio message from ${data.name}`, _template: 'table', _captcha: 'false' }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setState('sent')
      form.reset()
    } catch {
      setState('error')
    }
  }

  if (state === 'sent')
    return (
      <p className="contact-form__done" role="status">
        {t.sent}
      </p>
    )

  return (
    <form className="contact-form" onSubmit={submit}>
      <label>
        {t.name}
        <input id="cf-name" name="name" required autoComplete="name" maxLength={80} />
      </label>
      <label>
        {t.email}
        <input id="cf-email" name="email" type="email" required autoComplete="email" maxLength={120} />
      </label>
      <label>
        {t.message}
        <textarea id="cf-message" name="message" required rows={4} maxLength={3000} />
      </label>
      <input name="_honey" tabIndex={-1} autoComplete="off" className="contact-form__trap" aria-hidden />
      <button type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? t.sending : t.send}
      </button>
      {state === 'error' && (
        <p className="contact-form__error" role="alert">
          {t.sendError} <a href={`mailto:${contact.email}`}>{contact.email}</a> {t.instead}
        </p>
      )}
    </form>
  )
}
