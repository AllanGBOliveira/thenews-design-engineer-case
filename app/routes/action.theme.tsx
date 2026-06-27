import { type ActionFunctionArgs } from 'react-router'
import { config } from '../config'

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const theme = formData.get('theme') as 'light' | 'dark'
  const maxAge = 365 * 24 * 60 * 60

  return new Response(null, {
    status: 204,
    headers: {
      'Set-Cookie': `${config.themeCookieKey}=${theme}; Path=/; Max-Age=${maxAge}; SameSite=Lax`,
    },
  })
}
