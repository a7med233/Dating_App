import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      // This would call your API to fetch user profile
      // For now, we'll return a mock response
      return {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        gender: 'male',
        location: 'New York',
        bio: 'Looking for meaningful connections',
        photos: [],
        interests: [],
        preferences: {
          ageRange: { min: 20, max: 35 },
          distance: 50,
          gender: ['female'],
        },
        isProfileComplete: true,
        lastActive: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // This would call your API to update user profile
      return profileData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  preferences: {
    ageRange: { min: 18, max: 50 },
    distance: 25,
    gender: [],
    datingType: 'serious',
    lookingFor: 'relationship',
  },
  settings: {
    notifications: {
      newMatches: true,
      messages: true,
      likes: true,
      superLikes: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showDistance: true,
    },
    discovery: {
      showMe: true,
      showAge: true,
      showDistance: true,
    },
  },
  onboarding: {
    isComplete: false,
    currentStep: 0,
    steps: [
      'basic_info',
      'photos',
      'bio',
      'preferences',
      'location',
    ],
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfileField: (state, action) => {
      const { field, value } = action.payload;
      if (state.profile) {
        state.profile[field] = value;
      }
    },
    setPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setSettings: (state, action) => {
      const { category, settings } = action.payload;
      state.settings[category] = { ...state.settings[category], ...settings };
    },
    setOnboardingStep: (state, action) => {
      state.onboarding.currentStep = action.payload;
    },
    completeOnboarding: (state) => {
      state.onboarding.isComplete = true;
    },
    addPhoto: (state, action) => {
      if (state.profile && state.profile.photos) {
        state.profile.photos.push(action.payload);
      }
    },
    removePhoto: (state, action) => {
      if (state.profile && state.profile.photos) {
        state.profile.photos = state.profile.photos.filter(
          (_, index) => index !== action.payload
        );
      }
    },
    reorderPhotos: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      if (state.profile && state.profile.photos) {
        const photos = [...state.profile.photos];
        const [movedPhoto] = photos.splice(fromIndex, 1);
        photos.splice(toIndex, 0, movedPhoto);
        state.profile.photos = photos;
      }
    },
    updateLastActive: (state) => {
      if (state.profile) {
        state.profile.lastActive = new Date().toISOString();
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = { ...state.profile, ...action.payload };
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setProfile,
  updateProfileField,
  setPreferences,
  setSettings,
  setOnboardingStep,
  completeOnboarding,
  addPhoto,
  removePhoto,
  reorderPhotos,
  updateLastActive,
  clearError,
} = userSlice.actions;

export default userSlice.reducer; 