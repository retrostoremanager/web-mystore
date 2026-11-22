import '@testing-library/jest-dom'
import { configure } from '@testing-library/dom'

// Default waitFor timeout (1000ms) is tight for components with several
// chained async effects (auth headers -> API call -> state update -> commit).
// Found via Dashboard.test.jsx: removing unrelated JSX elsewhere on the page
// made each render pass faster, which (counter-intuitively) left *less* real
// wall-clock time for those effects to settle by the time waitFor's first
// polls ran -- several assertions started timing out at just over 1000ms
// despite the data resolving correctly (confirmed by tracing the actual
// effect). Raising the default here is more robust than padding individual
// tests with filler content or guessing at per-test timeouts.
configure({ asyncUtilTimeout: 3000 });
