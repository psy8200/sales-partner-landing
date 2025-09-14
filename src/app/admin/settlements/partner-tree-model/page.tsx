'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ReactFlowProvider, ReactFlow, Node, Edge, MarkerType, useNodesState, useEdgesState, Background, Controls, StepEdge, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import Elk from 'elkjs/lib/elk.bundled.js';

// 타입 정의
type TreeNode = {
  id: string;
  name: string;
  phone: string;
  myCode: string;
  referralCode: string;
  points: number;
  totalReferrals: number;
  level: number;
  position: 1 | 2 | 3;
  children: TreeNode[];
};

type TreeStatistics = {
  totalMembers: number;
  directReferrals: number;
  indirectReferrals: number;
  maxLevel: number;
};

// React Flow 노드 타입 정의
type FlowNode = Node & {
  data: {
    label: string;
    myCode: string;
    referralCode: string;
    totalPoints: number;
    totalReferrals: number;
    level: number;
    isRoot: boolean;
  };
};

// ELK 레이아웃 옵션 (상단에 가깝게 배치)
const layoutOptions = {
  'elk.algorithm': 'layered',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '32',        // H 간격 줄임
  'elk.layered.spacing.nodeNodeBetweenLayers': '40', // V 간격 줄임
  'elk.nodeSize.constraints': 'NODE_LABELS',
  'elk.nodeSize.options': 'DEFAULT_MINIMUM_SIZE',
  'elk.nodeSize.minimum': '160 140',   // width=160, height=140
  'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.nodePlacement.strategy': 'SIMPLE',
  'elk.spacing.componentComponent': '16',
  'elk.priority': 'CORRECTNESS'
};

// 트리 시각화 컴포넌트
function TreeVisualization() {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [statistics, setStatistics] = useState<TreeStatistics | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [focusMode, setFocusMode] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // React Flow 상태
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView, getNode, setViewport } = useReactFlow();

  // 3트리 데이터 로드 함수
  const loadTreeData = async (maxDepth: number = 10) => {
    try {
      setIsLoading(true);
      console.log('🌳 트리 구조 API 호출 시작');
      const response = await fetch(`/api/admin/settlements/partner-tree-model?maxDepth=${maxDepth}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 트리 구조 데이터:', data);
      
      if (data.success) {
        setTreeData(data.data.treeData);
        setStatistics(data.data.statistics);
        setError(null);
      } else {
        throw new Error(data.message || '트리 구조 조회 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('❌ 트리 데이터 로드 실패:', error);
      setError(error instanceof Error ? error.message : '트리 구조 조회 중 오류가 발생했습니다.');
      setTreeData(null);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 트리 데이터를 React Flow 형식으로 변환
  const convertToReactFlow = useCallback((treeData: TreeNode): { nodes: FlowNode[], edges: Edge[] } => {
    const nodes: FlowNode[] = [];
    const edges: Edge[] = [];
    
    // 재귀적으로 노드와 엣지 생성
    const processNode = (node: TreeNode, parentId?: string) => {
      const isRoot = node.level === 0;
      
      nodes.push({
        id: node.id,
        type: 'default',
        position: { x: 0, y: 0 }, // ELK에서 계산됨
        data: {
          label: isRoot ? '회사대표' : node.name,
          myCode: node.myCode,
          referralCode: node.referralCode,
          totalPoints: node.points || 0,
          totalReferrals: node.totalReferrals || 0,
          level: node.level,
          isRoot: isRoot
        },
        style: {
          width: 160,
          height: 140,
          backgroundColor: isRoot ? '#3B82F6' : (node.name === '빈 자리' ? '#F3F4F6' : '#10B981'),
          color: isRoot ? 'white' : (node.name === '빈 자리' ? '#6B7280' : 'white'),
          border: node.name === '빈 자리' ? '2px dashed #9CA3AF' : '2px solid #1F2937',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 'bold'
        }
      });
      
      if (parentId) {
        edges.push({
          id: `e${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          type: 'step',
          markerEnd: { 
            type: MarkerType.ArrowClosed,
            color: '#1F2937'
          },
          style: { 
            stroke: '#1F2937',
            strokeWidth: 3,
            vectorEffect: 'non-scaling-stroke'
          }
        });
      }
      
      node.children?.forEach(child => processNode(child, node.id));
    };
    
    processNode(treeData);
    return { nodes, edges };
  }, []);

  // ELK 레이아웃 적용
  const applyElkLayout = useCallback(async (nodes: FlowNode[], edges: Edge[]) => {
    try {
      const elk = new Elk();
      
      // ELK 형식으로 변환
      const elkNodes = nodes.map(node => ({
        id: node.id,
        width: 160,
        height: 140
      }));
      
      const elkEdges = edges.map(edge => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target]
      }));
      
      const graph = {
        id: 'root',
        children: elkNodes,
        edges: elkEdges,
        layoutOptions: layoutOptions
      };
      
      const layoutedGraph = await elk.layout(graph);
      
      // ELK 결과를 React Flow 노드에 적용
      const layoutedNodes = nodes.map(node => {
        const elkNode = layoutedGraph.children?.find(n => n.id === node.id);
        return {
          ...node,
          position: { 
            x: elkNode?.x || 0, 
            y: elkNode?.y || 0 
          }
        };
      });
      
      // 모든 단계를 상단에 가깝게 배치 (빨간 테두리 바로 아래)
      const rootNode = layoutedNodes.find(node => node.data.isRoot);
      if (rootNode) {
        // 전체 그래프의 너비를 계산
        const allXPositions = layoutedNodes.map(node => node.position.x);
        const minX = Math.min(...allXPositions);
        const maxX = Math.max(...allXPositions);
        const graphWidth = maxX - minX + 160; // 160은 노드 너비
        
        // 루트 노드를 화면 최상단 중앙에 강제로 위치시키기
        const offsetX = -rootNode.position.x; // x축 중앙 정렬
        const offsetY = -rootNode.position.y + 200; // y축을 200px 아래로 이동하여 최상단에 위치
        
        return layoutedNodes.map(node => ({
          ...node,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY
          }
        }));
      }
      
      return layoutedNodes;
    } catch (error) {
      console.error('ELK 레이아웃 적용 실패:', error);
      return nodes;
    }
  }, []);

  // 가시성 제어 - 보이는 레벨만 필터링
  const getVisibleNodes = useCallback((nodes: FlowNode[], level: number, focusNode?: string) => {
    if (focusNode) {
      // 포커스 뷰: 선택된 노드 ±2단계
      const focusNodeData = nodes.find(n => n.id === focusNode);
      if (!focusNodeData) return nodes;
      
      const focusLevel = focusNodeData.data.level;
      return nodes.filter(node => 
        Math.abs(node.data.level - focusLevel) <= 2
      );
    } else if (focusMode && selectedNode) {
      // 포커스 모드가 활성화되고 선택된 노드가 있을 때
      const focusNodeData = nodes.find(n => n.id === selectedNode);
      if (!focusNodeData) return nodes;
      
      const focusLevel = focusNodeData.data.level;
      return nodes.filter(node => 
        Math.abs(node.data.level - focusLevel) <= 2
      );
    } else {
      // 레벨 탭: 선택된 레벨 이하만
      return nodes.filter(node => node.data.level <= level);
    }
  }, [focusMode, selectedNode]);

  const getVisibleEdges = useCallback((edges: Edge[], visibleNodes: FlowNode[]) => {
    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return edges.filter(edge => 
      visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
  }, []);

  // 트리 데이터 변경 시 React Flow 업데이트
  // 페이지 로드 시 자동으로 데이터 로드
  useEffect(() => {
    loadTreeData(11);
  }, []);

  useEffect(() => {
    if (!treeData) {
      console.log('❌ treeData가 없습니다');
      return;
    }
    
    console.log('✅ treeData 로드됨:', treeData);
    const { nodes: flowNodes, edges: flowEdges } = convertToReactFlow(treeData);
    console.log('🔄 React Flow 노드/엣지 변환 완료:', { nodes: flowNodes.length, edges: flowEdges.length });
    
    // ELK 레이아웃 적용
    applyElkLayout(flowNodes, flowEdges).then(layoutedNodes => {
      console.log('🎯 ELK 레이아웃 적용 완료:', layoutedNodes.length, '개 노드');
      
      // 가시성 제어 적용
      const visibleNodes = getVisibleNodes(layoutedNodes, selectedLevel, focusMode ? selectedNode || undefined : undefined);
      const visibleEdges = getVisibleEdges(flowEdges, visibleNodes);
      
      console.log('👁️ 가시성 필터링 완료:', { visibleNodes: visibleNodes.length, visibleEdges: visibleEdges.length });
      
      setNodes(visibleNodes);
      setEdges(visibleEdges);
      
      // 초기 로딩 시 상단으로 자동 이동 (빨간 테두리 바로 아래)
      if (treeData && visibleNodes.length > 0) {
        setTimeout(() => {
          const rootNode = visibleNodes.find(node => node.data.isRoot);
          if (rootNode) {
            // 상단으로 이동 (빨간 테두리 바로 아래)
            fitView({
              nodes: [rootNode],
              padding: 0.02,
              duration: 800,
              minZoom: 0.5,
              maxZoom: 1.0
            });
          }
        }, 300);
      }
    });
  }, [treeData, selectedLevel, focusMode, selectedNode, fitView]);

  // 노드 클릭 핸들러
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
    console.log('선택된 노드:', node);
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* 상단 컨트롤 바 */}
      <div className="flex-shrink-0 p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-4 flex-wrap">
          {/* 레벨 탭 */}
          <div className="flex gap-2">
            {[0,1,2,3,4,5,6,7,8,9,10,11].map(level => (
              <button 
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3 py-1 rounded text-sm ${
                  selectedLevel === level 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {level === 0 ? '0단계(회사)' : `${level}단계`}
              </button>
            ))}
          </div>
          
          {/* 포커스 뷰 버튼 */}
          <button 
            onClick={() => {
              if (!selectedNode) {
                alert('포커스뷰를 사용하려면 먼저 노드를 클릭해주세요!');
                return;
              }
              setFocusMode(true);
            }}
            className={`px-3 py-1 rounded text-sm ${
              focusMode 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
            title="노드를 클릭한 후 사용하세요"
          >
            포커스뷰
          </button>
          
          {/* 전체보기 버튼 */}
          <button 
            onClick={() => setFocusMode(false)}
            className={`px-3 py-1 rounded text-sm ${
              !focusMode 
                ? 'bg-blue-500 text-white' 
                : 'bg-white text-gray-700 hover:bg-gray-100 border'
            }`}
            title="모든 레벨을 표시합니다"
          >
            전체보기
          </button>
          
          {/* 새로고침 버튼 */}
          <button
            onClick={async () => {
              await loadTreeData(11);
              // 새로고침 후 상단으로 이동 (빨간 테두리 바로 아래)
              setTimeout(() => {
                // 회사박스를 화면 최상단 중앙에 위치시키기
                setViewport({
                  x: 0,
                  y: 0,
                  zoom: 1
                }, { duration: 800 });
              }, 500);
            }}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {isLoading ? '로딩중...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 메인 컨텐츠 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 트리 시각화 영역 */}
        <div className="flex-1 relative">
          <div className="w-full h-[calc(100vh-200px)] border-4 border-red-500 rounded-lg overflow-auto bg-gray-50">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              fitView={false}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              minZoom={0.1}
              maxZoom={5.0}
              nodeTypes={{}}
              edgeTypes={{
                step: StepEdge,
              }}
            >
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        {/* 우측 패널 */}
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">선택된 노드 통계</h3>
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>직접 추천인:</span>
                <span className="font-semibold">{statistics?.directReferrals || 0}명</span>
              </div>
              <div className="flex justify-between">
                <span>간접 추천인:</span>
                <span className="font-semibold">{statistics?.indirectReferrals || 0}명</span>
              </div>
              <div className="flex justify-between">
                <span>총 포인트:</span>
                <span className="font-semibold">{(statistics?.totalMembers || 0) * 100000}원</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">노드를 선택해주세요</p>
          )}
          
          {/* 전체 통계 */}
          {statistics && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-2">전체 통계</h4>
              <div className="space-y-2 text-sm">
                <div>총 회원수: {statistics.totalMembers}명</div>
                <div>최대 레벨: {statistics.maxLevel}단계</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function PartnerTreeModelPage() {
  return (
    <ReactFlowProvider>
      <TreeVisualization />
    </ReactFlowProvider>
  );
}