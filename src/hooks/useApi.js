import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useApi = () => {
    const { axiosInstance } = useAuth();
    const queryClient = useQueryClient();

    // Generic GET request
    const useFetch = (key, endpoint, options = {}) => {
        return useQuery({
            queryKey: key,
            queryFn: async () => {
                const { data } = await axiosInstance.get(endpoint);
                return data;
            },
            ...options,
        });
    };

    // Generic POST mutation
    const usePost = (endpoint, options = {}) => {
        return useMutation({
            mutationFn: async (data) => {
                const response = await axiosInstance.post(endpoint, data);
                return response.data;
            },
            onSuccess: (data, variables, context) => {
                if (options.onSuccess) options.onSuccess(data, variables, context);
                toast.success(options.successMessage || 'Operation successful!');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Operation failed');
                if (options.onError) options.onError(error);
            },
            ...options,
        });
    };

    // Generic PUT mutation
    const useUpdate = (endpoint, options = {}) => {
        return useMutation({
            mutationFn: async ({ id, data }) => {
                const response = await axiosInstance.put(`${endpoint}/${id}`, data);
                return response.data;
            },
            onSuccess: (data, variables, context) => {
                if (options.invalidateQueries) {
                    queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
                }
                if (options.onSuccess) options.onSuccess(data, variables, context);
                toast.success(options.successMessage || 'Update successful!');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Update failed');
                if (options.onError) options.onError(error);
            },
            ...options,
        });
    };

    // Generic DELETE mutation
    const useDelete = (endpoint, options = {}) => {
        return useMutation({
            mutationFn: async (id) => {
                const response = await axiosInstance.delete(`${endpoint}/${id}`);
                return response.data;
            },
            onSuccess: (data, variables, context) => {
                if (options.invalidateQueries) {
                    queryClient.invalidateQueries({ queryKey: options.invalidateQueries });
                }
                if (options.onSuccess) options.onSuccess(data, variables, context);
                toast.success(options.successMessage || 'Deleted successfully!');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || 'Delete failed');
                if (options.onError) options.onError(error);
            },
            ...options,
        });
    };

    return {
        useFetch,
        usePost,
        useUpdate,
        useDelete,
        queryClient,
    };
};