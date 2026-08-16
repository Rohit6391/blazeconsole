import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Docs from '@/pages/Docs';
import Playground from '@/pages/Playground';
import Models from '@/pages/Models';
import Status from '@/pages/Status';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/models" element={<Models />} />
          <Route path="/status" element={<Status />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
