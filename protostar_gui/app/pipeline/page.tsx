'use client';
import { Suspense, useState, useCallback } from 'react';
import { SERVER_URL } from '../../lib/api';
import PipelineGraph from '../../components/PipelineGraph';
import NodeDetail from '../../components/NodeDetail';
import type { PipelineNode, PipelineEdge, NodeStatus } from '../../lib/pipeline';
import PipelinePageInner from './PipelineInner';

export default function PipelinePage() {
  return (
    <Suspense fallback={<PipelineFallback />}>
      <PipelinePageInner />
    </Suspense>
  );
}

function PipelineFallback() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ height: 20, width: 220, background: 'var(--surface-inset)', borderRadius: 'var(--radius)', marginBottom: 12 }} />
      <div style={{ height: 300, background: 'var(--surface-inset)', borderRadius: 'var(--radius)' }} />
    </div>
  );
}
