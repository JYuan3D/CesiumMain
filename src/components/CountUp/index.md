## CountUp


Demo:

```tsx
import React from 'react';
import CountUp from '@/components/CountUp';
export default () => <CountUp
  end={160527.012}
  duration={2.75}
>
</CountUp>;
```

```tsx
import React from 'react';
import CountUp from '@/components/CountUp';
export default () => <CountUp
  start={-875.039}
  end={160527.012}
  duration={2.75}
  separator=" "
  decimals={4}
  decimal=","
  onEnd={() => console.log('Ended! 👏')}
  onStart={() => console.log('Started! 💨')}
>
  {({ countUpRef, start }) => (
    <div>
      <span ref={countUpRef} />
      <br/>
      <button onClick={start}>Start</button>
    </div>
  )}
</CountUp>;
```

<API></API>


