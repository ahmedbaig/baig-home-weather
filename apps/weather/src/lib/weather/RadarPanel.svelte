<script lang="ts">
  import { EmptyState, Panel } from '@dashboard/ui';
</script>

<Panel class="radar">
  <h2 class="title">Where the clouds are</h2>
  <EmptyState
    label="Not wired yet"
    title="Radar loop"
    message="BOM radar frames arrive with the Go weather service. The browser never calls BOM directly."
  />
</Panel>

<style>
  .title {
    margin-bottom: 16px;
    font-size: var(--size-panel);
  }
</style>
