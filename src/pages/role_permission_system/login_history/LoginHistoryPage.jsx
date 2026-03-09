import EntityListPage from '../../employee_hr_management/shared/EntityListPage';
import { loginHistoryService } from '../../../services/role_permission_system/login_history/loginHistoryService';

export default function LoginHistoryPage() {
  return (
    <EntityListPage
      title='Login Histories'
      listFetcher={loginHistoryService.list}
      keyField='history_id'
      defaultParams={{ sortBy: 'history_id', sortDir: 'asc' }}
    />
  );
}

