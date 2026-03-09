import EntityListPage from '../../employee_hr_management/shared/EntityListPage';
import { userSessionService } from '../../../services/role_permission_system/user_session/userSessionService';

export default function UserSessionPage() {
  return (
    <EntityListPage
      title='User Sessions'
      listFetcher={userSessionService.list}
      keyField='session_id'
      defaultParams={{ sortBy: 'session_id', sortDir: 'asc' }}
    />
  );
}

