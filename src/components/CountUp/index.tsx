import ReactCountUp from 'react-countup';
import { CountUpProps } from 'react-countup/build/CountUp';

const CountUp: React.FC<CountUpProps> = (props) => {
  return <ReactCountUp duration={2.75} {...props}></ReactCountUp>;
};

export default CountUp;
