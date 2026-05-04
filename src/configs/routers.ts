import DASHBOARD from '../pages/dashboard.jsx';
import DEVICES from '../pages/devices.jsx';
import AREAS from '../pages/areas.jsx';
import INSPECTION_EXECUTE from '../pages/inspection-execute.jsx';
import INSPECTION_RECORDS from '../pages/inspection-records.jsx';
import REPAIRS from '../pages/repairs.jsx';
export const routers = [{
  id: "dashboard",
  component: DASHBOARD
}, {
  id: "devices",
  component: DEVICES
}, {
  id: "areas",
  component: AREAS
}, {
  id: "inspection-execute",
  component: INSPECTION_EXECUTE
}, {
  id: "inspection-records",
  component: INSPECTION_RECORDS
}, {
  id: "repairs",
  component: REPAIRS
}]