<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fly } from 'svelte/transition';
  import type { ToastStore } from '../toaster.svelte';
  import Toast from './Toast.svelte';

  interface Props {
    store: ToastStore;
  }

  let { store }: Props = $props();
</script>

<section class="toaster" aria-label="Notifications" aria-live="polite">
  {#each store.items as toast (toast.id)}
    <div animate:flip={{ duration: 180 }} transition:fly={{ x: 24, duration: 180 }}>
      <Toast {toast} ondismiss={(id) => store.dismiss(id)} />
    </div>
  {/each}
</section>

<style>
  .toaster {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 50;
    display: grid;
    gap: 10px;
    width: min(380px, calc(100vw - 32px));
  }
</style>
