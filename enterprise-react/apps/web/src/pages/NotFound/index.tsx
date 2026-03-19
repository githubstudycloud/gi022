import React from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@enterprise/ui';

const NotFoundPage: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
    <p className="text-8xl font-bold text-gray-200">404</p>
    <h1 className="text-2xl font-bold text-gray-800">页面不存在</h1>
    <p className="text-sm text-gray-500">抱歉，您访问的页面不存在或已被移除</p>
    <Button asChild>
      <Link to="/">返回首页</Link>
    </Button>
  </div>
);

export default NotFoundPage;
