import React, { useRef, useState } from 'react';
import { useRestaurantContext } from '@/context/restaurant';

//Styles
import * as Styles from './recent-reviews.styles';
import { DashboardContent, FlexContainer, Text } from '@/components/UI';
import { Avatar, Box, Divider, Grid, Pagination, Rating } from '@mui/material';

// Helpers
import { getDate } from '@/helpers/dateHelpers';

const RecentReviews = ({ reviews }) => {
  const { details } = useRestaurantContext();

  const [page, setPage] = useState(1);
  const reviewLimit = useRef(4);

  const totalPage = Math.ceil(reviews.length / reviewLimit.current);

  const pageHandler = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <React.Fragment>
      <Grid container columnSpacing={1}>
        <Grid item xs={12}>
          <Styles.Header variant="subHeader">Recent Reviews</Styles.Header>
        </Grid>
        {reviews
          .slice((page - 1) * reviewLimit.current, page * reviewLimit.current)
          .map((review) => (
            <Grid item xs={12} sm={6} md={3} key={review.id}>
              <DashboardContent>
                <Styles.Details>
                  <Avatar
                    alt="User Avatar"
                    src={
                      review.userId.avatar &&
                      getFileUrl(
                        process.env.NEXT_PUBLIC_AWS_S3_USERS_BUCKET,
                        `${review.userId.id}/avatar/${review.userId.avatar}`
                      )
                    }
                    sx={{
                      height: 60,
                      width: 60,
                    }}
                  >
                    {review.userId.name.slice(0, 1)}
                  </Avatar>
                  <Box>
                    <Styles.Name variant="body">{review.userId.name}</Styles.Name>
                    <Text variant="sub" sx={{ display: 'block' }}>
                      Posted on {getDate(review.createdAt)}
                    </Text>
                  </Box>
                </Styles.Details>
                <Divider orientation="horizontal" sx={{ mb: 2, mt: 2 }} />
                <Styles.Details>
                  <Avatar
                    alt="restaurant-avatar"
                    src={
                      details.cover &&
                      getFileUrl(
                        process.env.NEXT_PUBLIC_AWS_S3_RESTAURANTS_BUCKET,
                        `${details.id}/cover/${details.cover}`
                      )
                    }
                    sx={{
                      height: 60,
                      width: 60,
                    }}
                  >
                    {details.name.slice(0, 1)}
                  </Avatar>
                  <Box>
                    <Styles.Name variant="body">{details.name}</Styles.Name>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                </Styles.Details>
                <Text variant="body" sx={{ display: 'block', mt: 2 }}>
                  {review.content.slice(0, 250)}
                  {review.content.length > 250 && '...'}
                </Text>
              </DashboardContent>
            </Grid>
          ))}
      </Grid>
      <FlexContainer>
        <Pagination
          color="primary"
          count={totalPage}
          variant="outlined"
          shape="rounded"
          sx={{
            mt: 3,
            '& .MuiPaginationItem-root:not(.Mui-selected)': {
              color: 'text.secondary',
            },
          }}
          page={page}
          onChange={pageHandler}
        />
      </FlexContainer>
    </React.Fragment>
  );
};

export default RecentReviews;
