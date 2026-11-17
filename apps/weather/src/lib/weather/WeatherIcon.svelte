<script lang="ts">
  import type { Sky } from './codes';

  interface Props {
    sky: Sky;
    size?: number;
    label?: string;
  }

  let { sky, size = 24, label }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.6"
  stroke-linecap="square"
  role={label ? 'img' : undefined}
  aria-label={label}
  aria-hidden={label ? undefined : 'true'}
>
  {#if sky === 'clear'}
    <circle cx="12" cy="12" r="4.5" />
    <path
      d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"
    />
  {:else if sky === 'partly'}
    <path d="M9 3.5v1.6M3.5 9h1.6M5.1 5.1l1.1 1.1M12.9 5.1l-1.1 1.1" />
    <path d="M6.2 11.2A3.8 3.8 0 0 1 12.6 8" />
    <path d="M8 20h9.5a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6 1.2A2.9 2.9 0 0 0 8 20Z" />
  {:else if sky === 'fog'}
    <path d="M4 9h16M2 13h20M5 17h14" />
  {:else if sky === 'rain'}
    <path d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 15Z" />
    <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
  {:else if sky === 'storm'}
    <path d="M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 14Z" />
    <path d="M12.5 15.5 10 19h4l-2.5 3.5" />
  {:else}
    <path d="M6.5 18h11a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.6 1.7A3.7 3.7 0 0 0 6.5 18Z" />
  {/if}
</svg>
