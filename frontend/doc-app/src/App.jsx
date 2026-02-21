import { Routes, Route, useLocation, Link } from 'react-router-dom';
import DocLayout from 'bpm/DocLayout';
import DocNav from 'bpm/DocNav';
import DocSidebar from 'bpm/DocSidebar';
import Home from './pages/Home';
import GetStartedInstallation from './pages/GetStartedInstallation';
import GetStartedFundamentals from './pages/GetStartedFundamentals';
import GetStartedFirstApp from './pages/GetStartedFirstApp';
import Components from './pages/Components';
import ApiReferenceText from './pages/ApiReferenceText';
import ApiReferenceData from './pages/ApiReferenceData';
import ApiReferenceCharts from './pages/ApiReferenceCharts';
import ApiReferenceInputs from './pages/ApiReferenceInputs';
import ApiReferenceLayout from './pages/ApiReferenceLayout';
import ApiReferencePanels from './pages/ApiReferencePanels';
import ApiReferenceMedia from './pages/ApiReferenceMedia';
import ApiReferenceStatus from './pages/ApiReferenceStatus';
import ApiReferenceChat from './pages/ApiReferenceChat';
import ApiReferenceConfig from './pages/ApiReferenceConfig';
import ApiReferenceConnection from './pages/ApiReferenceConnection';
import DeployConcepts from './pages/DeployConcepts';
import DeployPlatforms from './pages/DeployPlatforms';
import KnowledgeBaseFaq from './pages/KnowledgeBaseFaq';
import KnowledgeBaseTroubleshooting from './pages/KnowledgeBaseTroubleshooting';
import CheatSheet from './pages/CheatSheet';
import NotFound from './pages/NotFound';
import { docNavLinks, docSidebarSections } from './docConfig';

function App() {
  const location = useLocation();
  const path = location.pathname;

  const sectionsWithActive = docSidebarSections.map((section) => ({
    ...section,
    links: section.links.map((link) => ({
      ...link,
      active: path === link.href || (link.href !== '/' && path.startsWith(link.href)),
    })),
  }));

  return (
    <DocLayout
      nav={
        <DocNav
          homeUrl="/"
          logoUrl="/Logo BPM.png"
          links={docNavLinks}
          linkComponent={Link}
        />
      }
      sidebar={<DocSidebar sections={sectionsWithActive} linkComponent={Link} />}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/get-started/installation" element={<GetStartedInstallation />} />
        <Route path="/get-started/fundamentals" element={<GetStartedFundamentals />} />
        <Route path="/get-started/first-app" element={<GetStartedFirstApp />} />
        <Route path="/components" element={<Components />} />
        <Route path="/api-reference/text" element={<ApiReferenceText />} />
        <Route path="/api-reference/data" element={<ApiReferenceData />} />
        <Route path="/api-reference/charts" element={<ApiReferenceCharts />} />
        <Route path="/api-reference/inputs" element={<ApiReferenceInputs />} />
        <Route path="/api-reference/layout" element={<ApiReferenceLayout />} />
        <Route path="/api-reference/panels" element={<ApiReferencePanels />} />
        <Route path="/api-reference/media" element={<ApiReferenceMedia />} />
        <Route path="/api-reference/status" element={<ApiReferenceStatus />} />
        <Route path="/api-reference/chat" element={<ApiReferenceChat />} />
        <Route path="/api-reference/config" element={<ApiReferenceConfig />} />
        <Route path="/api-reference/connection" element={<ApiReferenceConnection />} />
        <Route path="/deploy/concepts" element={<DeployConcepts />} />
        <Route path="/deploy/platforms" element={<DeployPlatforms />} />
        <Route path="/knowledge-base/faq" element={<KnowledgeBaseFaq />} />
        <Route path="/knowledge-base/troubleshooting" element={<KnowledgeBaseTroubleshooting />} />
        <Route path="/cheat-sheet" element={<CheatSheet />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DocLayout>
  );
}

export default App;
