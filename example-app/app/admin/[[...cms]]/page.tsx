import AdminPage from '@git-cms/core/next/page'
import { blockSchemas, pageSchemas, contentBase } from '../../../cms.config'

export default async function Page() {
  return AdminPage({ blockSchemas, pageSchemas, contentBase })
}
