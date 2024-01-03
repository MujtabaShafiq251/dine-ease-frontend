import React, { useContext } from 'react';
import Image from 'next/image';
import { enqueueSnackbar } from 'notistack';

import ProfileContext from '@/context/profile-context/profile-context';

// Services
import { updateProfileImage } from '@/services';

// Styles
import { Box, Button } from '@mui/material';
import { Text } from '@/components/UI';
import { BannerContainer } from './banner.styles';

// Helpers
import { getFileUrl } from '@/helpers/fileHelpers';
import { getError } from '@/helpers/snackbarHelpers';

const Banner = () => {
  const { details, coverHandler, newCoverHandler } = useContext(ProfileContext);

  const { cover, newCover } = details;

  const handleConfirmBanner = async () => {
    try {
      const formData = new FormData();
      formData.append('type', 'cover');
      formData.append('file', newCover);

      const response = await updateProfileImage(formData);
      coverHandler(response.data);

      enqueueSnackbar({
        variant: 'success',
        message: 'Cover Updated Successfully!',
      });
    } catch (e) {
      enqueueSnackbar({ variant: 'error', message: getError(e) });
    }
  };

  const handleCancelBanner = () => {
    newCoverHandler(null);
  };

  return (
    <BannerContainer>
      <Image
        src={
          (newCover && URL.createObjectURL(newCover)) ||
          (cover &&
            getFileUrl(
              process.env.NEXT_PUBLIC_USER_BUCKET,
              `${details.id}/cover/${cover}`
            ))
        }
        fill={true}
        objectFit="cover"
        alt="User Cover"
      />
      <Box sx={{ position: 'absolute', top: 15, right: 15 }}>
        {newCover && (
          <React.Fragment>
            <Button
              variant="contained"
              color="success"
              sx={{ mr: 1 }}
              onClick={handleConfirmBanner}
            >
              <Text variant="body">Save Changes</Text>
            </Button>
            <Button variant="contained" color="error" onClick={handleCancelBanner}>
              <Text variant="body" color="text.primary">
                Cancel
              </Text>
            </Button>
          </React.Fragment>
        )}
      </Box>
    </BannerContainer>
  );
};

export default Banner;
