import EntityListPage from '../../employee_hr_management/shared/EntityListPage';
import { userHistoryService } from '../../../services/role_permission_system/user_history/userHistoryService';

export default function UserHistoryPage() {
  return (
    <EntityListPage
      title='User Histories'
      listFetcher={userHistoryService.list}
      keyField='history_id'
      defaultParams={{ sortBy: 'history_id', sortDir: 'asc' }}
    />
  );
}

