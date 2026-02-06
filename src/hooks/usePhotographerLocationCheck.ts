// frontend/src/hooks/usePhotographerLocationCheck.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

interface LocationData {
  province_id: string | null;
  province_name: string | null;
  city_id: string | null;
  city_name: string | null;
  business_name?: string;
  full_name?: string;
}

interface ProfileCompletion {
  is_complete: boolean;
  missing_fields: string[];
  current_data: LocationData;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UsePhotographerLocationCheckReturn {
  showModal: boolean;
  profileComplete: boolean;
  loading: boolean;
  locationData: LocationData | null;
  handleModalClose: () => void;
  handleLocationComplete: (newLocationData: any) => void;
  reopenModal: () => void;
  recheckCompletion: () => Promise<void>;
}

const usePhotographerLocationCheck = (): UsePhotographerLocationCheckReturn => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [profileComplete, setProfileComplete] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  const checkProfileCompletion = async (): Promise<void> => {
    setLoading(true);
    
    try {
      // 🆕 ADD CACHE BUSTING & NO-CACHE HEADERS
      const response = await axios.get<ApiResponse<ProfileCompletion>>(
        '/api/photographer/profile/check-completion',
        {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          // Add timestamp to prevent caching
          params: {
            _t: new Date().getTime()
          }
        }
      );
      
      console.log('🔍 Raw API Response:', response.data);
      
      if (response.data.success && response.data.data) {
        const completion = response.data.data;
        
        console.log('📋 Profile completion check:', {
          is_complete: completion.is_complete,
          missing_fields: completion.missing_fields,
          current_data: completion.current_data
        });
        
        setProfileComplete(completion.is_complete);
        setLocationData(completion.current_data);
        
        // Show modal if profile is incomplete
        const dismissedThisSession = sessionStorage.getItem('location_modal_dismissed');
        
        console.log('🎯 Modal Decision:', {
          is_complete: completion.is_complete,
          dismissedThisSession,
          willShowModal: !completion.is_complete && !dismissedThisSession
        });
        
        if (!completion.is_complete && !dismissedThisSession) {
          console.log('✅ SHOWING MODAL - Profile incomplete');
          setShowModal(true);
        } else {
          console.log('❌ NOT SHOWING MODAL:', {
            reason: completion.is_complete 
              ? 'Profile is complete' 
              : 'User dismissed this session'
          });
        }
      }
    } catch (error: any) {
      console.error('❌ Check profile completion error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = (): void => {
    console.log('🚪 Modal closed by user');
    setShowModal(false);
    sessionStorage.setItem('location_modal_dismissed', 'true');
  };

  const handleLocationComplete = (newLocationData: any): void => {
    console.log('✅ Location completed:', newLocationData);
    
    setProfileComplete(true);
    setLocationData(newLocationData);
    setShowModal(false);
    
    sessionStorage.removeItem('location_modal_dismissed');
  };

  const reopenModal = (): void => {
    console.log('🔄 Reopening modal');
    setShowModal(true);
    sessionStorage.removeItem('location_modal_dismissed');
  };

  return {
    showModal,
    profileComplete,
    loading,
    locationData,
    handleModalClose,
    handleLocationComplete,
    reopenModal,
    recheckCompletion: checkProfileCompletion
  };
};

export default usePhotographerLocationCheck;