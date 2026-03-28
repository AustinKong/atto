/*
 * PERFORMANCE ARCHITECTURE: Uncontrolled ReactFlow mode
 *
 * WHY UNCONTROLLED:
 * In controlled mode (nodes/edges as React state + onNodesChange), ReactFlow fires
 * a position NodeChange on every mousemove during drag — roughly 60 times/sec.
 * Each fires setNodes → re-renders FlowInner → passes a new nodes array into
 * ReactFlow → full reconciliation. Uncontrolled mode hands position ownership to
 * ReactFlow's internal Zustand store, so drag never touches React state at all.
 *
 * HOW MUTATIONS WORK (instead of setNodes/setEdges):
 *   addNodes / addEdges   — when a new node/edge is created from the picker menu
 *   updateNodeData(id, …) — when a node's form is saved (debounced, see below)
 *   deleteElements(…)     — when the delete button is pressed; also removes edges
 *   All are accessed via useReactFlow() which is stable across renders.
 *
 * OTHER OPTIMISATIONS IN PLACE (not removed by this refactor):
 *   • StatusEventNode is wrapped in React.memo — skips re-render unless data.event
 *     reference actually changes.
 *   • Form changes use a watch() subscription with a 300 ms debounce, so
 *     updateNodeData is called at most ~3×/sec while the user is typing rather
 *     than on every keystroke.
 *   • onChange / onDelete callbacks live in FlowCallbackContext with stable
 *     references (useCallback), so memo comparisons on node data are never
 *     invalidated by callback churn.
 *
 * SERIALISATION (future):
 *   Because ReactFlow owns state, read it back with getNodes() / getEdges().
 *   Map nodes → StatusEvent[] via node.data.event for persistence.
 *   A natural save point is onNodeDragStop (position settled) combined with the
 *   existing debounced onChange (field edits settled).
 */

import '@xyflow/react/dist/style.css';

import {
  Background,
  BackgroundVariant,
  type Connection,
  ConnectionLineType,
  Controls,
  type FinalConnectionState,
  type Node,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import { useCallback, useMemo } from 'react';

import { useColorMode } from '@/components/ui/ColorMode';
import type { Application, StatusEnum } from '@/types/application.types';
import type { StatusEvent } from '@/types/application.types';
import { ISODate, type ISODatetime } from '@/utils/date.utils';

import { FlowCallbackContext } from './FlowCallbackContext';
import type { FormValues } from './StatusEventNode';
import { StatusEventNode, type StatusEventNodeData } from './StatusEventNode';

const NODE_WIDTH = 280;
const NODE_H_GAP = 80;
const NODE_ORIGIN: [number, number] = [0, 0.5];

const nodeTypes = { statusEvent: StatusEventNode };

function buildInitialNodes(events: StatusEvent[]): Node[] {
  const source =
    events.length > 0
      ? events
      : [
          {
            id: crypto.randomUUID(),
            status: 'applied' as const,
            date: ISODate.today(),
            notes: null,
            referrals: [],
          } as StatusEvent,
        ];

  return source.map((event, i) => ({
    id: event.id,
    type: 'statusEvent',
    position: { x: i * (NODE_WIDTH + NODE_H_GAP), y: 0 },
    data: { event } satisfies StatusEventNodeData,
  }));
}

function buildInitialEdges(events: StatusEvent[]) {
  return events.slice(0, -1).map((event, i) => ({
    id: `e-${event.id}-${events[i + 1].id}`,
    source: event.id,
    target: events[i + 1].id,
  }));
}

type FlowInnerProps = {
  application: Application;
  onCreateNew?: () => void;
  isCreatingNew?: boolean;
  title?: string;
};

function FlowInner({ application }: FlowInnerProps) {
  const { screenToFlowPosition, addNodes, addEdges, updateNodeData, deleteElements } =
    useReactFlow();
  const { colorMode } = useColorMode();

  const handleChange = useCallback(
    (id: string, values: FormValues) => {
      const updated = buildEventFromForm(id, values);
      updateNodeData(id, { event: updated } satisfies StatusEventNodeData);
    },
    [updateNodeData]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteElements({ nodes: [{ id }] });
    },
    [deleteElements]
  );

  const callbacks = useMemo(
    () => ({ onChange: handleChange, onDelete: handleDelete }),
    [handleChange, handleDelete]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      addEdges([{ ...connection, id: `e-${connection.source}-${connection.target}` }]);
    },
    [addEdges]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      if (connectionState.toHandle) return;
      if (!connectionState.fromNode) return;

      const clientX = 'clientX' in event ? event.clientX : event.touches[0].clientX;
      const clientY = 'clientY' in event ? event.clientY : event.touches[0].clientY;

      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
      const newId = crypto.randomUUID();
      const defaultEvent = buildDefaultEvent(newId, 'applied');

      addNodes([
        {
          id: newId,
          type: 'statusEvent',
          position: flowPos,
          origin: NODE_ORIGIN,
          data: { event: defaultEvent } satisfies StatusEventNodeData,
        },
      ]);
      addEdges([
        {
          id: `e-${connectionState.fromNode.id}-${newId}`,
          source: connectionState.fromNode.id,
          target: newId,
        },
      ]);
    },
    [screenToFlowPosition, addNodes, addEdges]
  );

  return (
    <FlowCallbackContext.Provider value={callbacks}>
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          border: '1px solid var(--chakra-colors-border)',
        }}
      >
        <ReactFlow
          defaultNodes={buildInitialNodes(application.statusEvents)}
          defaultEdges={buildInitialEdges(application.statusEvents)}
          nodeTypes={nodeTypes}
          nodeOrigin={NODE_ORIGIN}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          colorMode={colorMode}
        >
          <Background variant={BackgroundVariant.Dots} />
          <Controls />
        </ReactFlow>
      </div>
    </FlowCallbackContext.Provider>
  );
}

function buildDefaultEvent(id: string, status: StatusEnum): StatusEvent {
  const base = { id, date: ISODate.today(), notes: null };
  switch (status) {
    case 'applied':
      return { ...base, status, referrals: [] };
    case 'interview':
      return { ...base, status, stage: 1, interviewers: [], scheduledAt: null, location: null };
    default:
      return { ...base, status } as StatusEvent;
  }
}

function buildEventFromForm(id: string, values: FormValues): StatusEvent {
  const base = { id, date: values.date as ISODate, notes: values.notes || null };
  switch (values.status) {
    case 'applied':
      return { ...base, status: 'applied', referrals: values.referrals };
    case 'interview':
      return {
        ...base,
        status: 'interview',
        stage: values.stage,
        interviewers: values.interviewers,
        scheduledAt: values.scheduledAt ? (new Date().toISOString() as ISODatetime) : null,
        location: values.location || null,
      };
    default:
      return { ...base, status: values.status } as StatusEvent;
  }
}

export function ApplicationFlow({
  application,
  onCreateNew,
  isCreatingNew,
  title,
}: {
  application: Application;
  onCreateNew?: () => void;
  isCreatingNew?: boolean;
  title?: string;
}) {
  return (
    <ReactFlowProvider>
      <FlowInner
        application={application}
        onCreateNew={onCreateNew}
        isCreatingNew={isCreatingNew}
        title={title}
      />
    </ReactFlowProvider>
  );
}
