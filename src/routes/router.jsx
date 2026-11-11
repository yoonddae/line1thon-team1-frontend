import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import TabLayout from '@/components/layout/TabLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ROUTES } from '@/constants/routes';

import SplashPage from '@/pages/auth/SplashPage';
import LoginPage from '@/pages/auth/LoginPage';
import SignupPage from '@/pages/auth/SignupPage';
import ForestPage from '@/pages/forest/ForestPage';
import ReviewPage from '@/pages/review/ReviewPage';
import MyPage from '@/pages/my/MyPage';
import TreeDetailPage from '@/pages/tree/TreeDetailPage';
import TreeFormPage from '@/pages/tree/TreeFormPage';
import BranchPage from '@/pages/branch/BranchPage';
import MaterialInputPage from '@/pages/study/MaterialInputPage';
import QuizPage from '@/pages/quiz/QuizPage';
import QuizResultPage from '@/pages/quiz/QuizResultPage';
import RecordPage from '@/pages/record/RecordPage';
import NotFoundPage from '@/pages/NotFoundPage';

const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <NotFoundPage />,
    children: [
      // 시작하기 (로그인 전)
      { path: ROUTES.START, element: <SplashPage /> },
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.SIGNUP, element: <SignupPage /> },

      // 로그인 후
      {
        element: <ProtectedRoute />,
        children: [
          // 하단 탭바가 보이는 화면
          {
            element: <TabLayout />,
            children: [
              { path: ROUTES.FOREST, element: <ForestPage /> },
              { path: ROUTES.REVIEW, element: <ReviewPage /> },
              { path: ROUTES.MY, element: <MyPage /> },
              { path: ROUTES.TREE(), element: <TreeDetailPage /> },
              { path: ROUTES.BRANCH(), element: <BranchPage /> },
            ],
          },
          // 탭바 없는 화면
          { path: ROUTES.TREE_CREATE, element: <TreeFormPage /> },
          { path: ROUTES.TREE_EDIT(), element: <TreeFormPage /> },
          { path: ROUTES.STUDY(), element: <MaterialInputPage /> },
          { path: ROUTES.QUIZ(), element: <QuizPage /> },
          { path: ROUTES.QUIZ_RESULT(), element: <QuizResultPage /> },
          { path: ROUTES.LEAF(), element: <RecordPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default router;
