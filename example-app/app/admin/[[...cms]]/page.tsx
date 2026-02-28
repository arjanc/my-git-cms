import AdminPage from '@git-cms/core/next/page'
import { blockSchemas, pageSchemas, contentBase, navPath } from '../../../cms.config'

export default async function Page() {
  return AdminPage({ blockSchemas, pageSchemas, contentBase, navPath })
}
