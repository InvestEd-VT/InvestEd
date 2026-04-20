import { useParams, Navigate } from 'react-router-dom';
import IntroToOptions from '@/components/education/modules/IntroToOptions';
import IntroToSelling from '@/components/education/modules/IntroToSelling';
import CallsAndPuts from '@/components/education/modules/CallsAndPuts';
import GreeksOverview from '@/components/education/modules/GreeksOverview';
import StrikePriceAndExpiration from '@/components/education/modules/StrikePriceAndExpiration';
import OptionPremium from '@/components/education/modules/OptionPremium';
import Moneyness from '@/components/education/modules/Moneyness';
import Delta from '@/components/education/modules/Delta';
import Gamma from '@/components/education/modules/Gamma';

const MODULE_COMPONENTS: Record<string, React.ComponentType> = {
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890': IntroToOptions,
  'b2c3d4e5-f6a7-8901-bcde-f12345678901': IntroToSelling,
  'c3d4e5f6-a7b8-9012-cdef-123456789012': CallsAndPuts,
  'd4e5f6a7-b8c9-0123-defa-234567890123': GreeksOverview,
  'e5f6a7b8-c9d0-1234-efab-345678901234': StrikePriceAndExpiration,
  'f6a7b8c9-d0e1-2345-fabc-456789012345': OptionPremium,
  'a7b8c9d0-e1f2-3456-abcd-567890123456': Moneyness,
  'b8c9d0e1-f2a3-4567-bcde-678901234567': Delta,
  'c9d0e1f2-a3b4-5678-cdef-789012345678': Gamma,
};

export default function ModuleRouter() {
  const { id } = useParams<{ id: string }>();
  const Component = id ? MODULE_COMPONENTS[id] : null;

  if (!Component) return <Navigate to="/learn" replace />;
  return <Component />;
}
