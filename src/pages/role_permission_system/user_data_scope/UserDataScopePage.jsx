import EntityListPage from '../../employee_hr_management/shared/EntityListPage';
import { userDataScopeService } from '../../../services/role_permission_system/user_data_scope/userDataScopeService';

export default function UserDataScopePage() {
  return (
    <EntityListPage
      title='User Data Scopes'
      listFetcher={userDataScopeService.list}
      keyField='scopeId'
      defaultParams={{ sortBy: 'scopeId', sortDir: 'asc' }}
    />
  );
}
