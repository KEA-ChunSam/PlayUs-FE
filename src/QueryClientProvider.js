import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

// QueryClient 인스턴스 생성
const queryClient = new QueryClient();

const ReactQueryProvider = ({children}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default ReactQueryProvider;