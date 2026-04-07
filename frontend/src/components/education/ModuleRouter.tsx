import { useParams, Navigate } from 'react-router-dom';
import IntroToOptions from '@/components/education/modules/IntroToOptions';
import IntroToSelling from '@/components/education/modules/IntroToSelling';
import CallsAndPuts from '@/components/education/modules/CallsAndPuts';

const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': IntroToOptions,
  'b2c3d4e5-f6a7-8901-bcde-f12345678901': IntroToSelling,
  'c3d4e5f6-a7b8-9012-cdef-123456789012': CallsAndPuts,
};

export default function ModuleRouter() {
  const { id } = useParams<{ id: string }>();
  const Component = id ? MODULE_COMPONENTS[id] : null;

  if (!Component) return <Navigate to="/learn" replace />;
  return <Component />;
}
