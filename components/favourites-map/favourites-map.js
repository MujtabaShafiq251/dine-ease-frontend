import React, { useState, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';

// Map
import ReactMapGL, { Marker, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Styles
import * as Styles from './favourites-map.styles';

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';

// Utils
import { MapThemes, MapZoomLevels } from '@/utils/constants';

// Helpers
import { getFileUrl } from '@/helpers/fileHelpers';

// Components
import MapTheme from './map-theme/map-theme';
import FavouriteRestaurants from './favourite-restaurants/favourite-restaurants';
import Image from 'next/image';
import { FlexContainer, Text } from '../UI';
import { IconButton, Rating, Tooltip } from '@mui/material';

const FavouritesMap = ({ data }) => {
  const [theme, setTheme] = useState(data.theme);
  const [hoverId, setHoverId] = useState(null);
  const [popupDetails, setPopupDetails] = useState(null);

  const { coordinates } = data.restaurants?.length && data.restaurants[0].location;
  const longitude = (coordinates && coordinates[0]) || 0;
  const latitude = (coordinates && coordinates[1]) || 0;

  const mapRef = useRef(null);

  const initialView = useMemo(
    () => ({
      latitude,
      longitude,
      zoom: 5,
      minZoom: 4,
    }),
    [latitude, longitude]
  );

  const [viewState, setViewState] = useState(initialView);

  const flyToLocation = useCallback((long, lat) => {
    mapRef.current?.flyTo({
      center: [long, lat],
      duration: 1500,
      zoom: MapZoomLevels.MAP_ZOOM,
    });
  }, []);

  const onMove = useCallback(({ viewState }) => {
    setViewState(viewState);
  }, []);

  const hoverIdHandler = (value) => {
    if (value === hoverId) return;
    setHoverId(value);
  };

  const resetHoverIdHandler = () => {
    setHoverId(null);
  };

  const popupHandler = (details) => {
    setPopupDetails(details);
  };

  return (
    <React.Fragment>
      <MapTheme selectedTheme={theme} setTheme={setTheme} details={data.userId} />
      <FavouriteRestaurants
        restaurants={data.restaurants}
        flyToLocation={flyToLocation}
        hoverIdHandler={hoverIdHandler}
        resetHoverIdHandler={resetHoverIdHandler}
      />
      <Styles.MapContainer>
        <ReactMapGL
          {...viewState}
          ref={mapRef}
          width="100%"
          height="100%"
          onMove={onMove}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_API_TOKEN}
          mapStyle={MapThemes[theme]}
        >
          {data.restaurants.map((i) => {
            const { coordinates } = i.location;
            return (
              <React.Fragment key={i.slug}>
                {popupDetails && (
                  <Popup
                    longitude={popupDetails.location.coordinates[0]}
                    latitude={popupDetails.location.coordinates[1]}
                    focusAfterOpen={false}
                    closeButton={false}
                    closeOnClick={false}
                    offset={{
                      bottom: [0, -20],
                    }}
                  >
                    <Image
                      src={
                        (popupDetails.cover &&
                          getFileUrl(
                            process.env.NEXT_PUBLIC_AWS_S3_RESTAURANTS_BUCKET,
                            `${popupDetails.id}/cover/${popupDetails.cover}`
                          )) ||
                        '/assets/images/bg-placeholder.png'
                      }
                      alt="restaurant"
                      height={150}
                      width={200}
                      style={{ borderRadius: '5px' }}
                    />
                    <FlexContainer sx={{ justifyContent: 'space-between' }}>
                      <Text variant="body" fontWeight={600}>
                        {popupDetails.name}
                      </Text>
                      <Link href={`/restaurant/${popupDetails.slug}`} target="_blank">
                        <IconButton color="primary" sx={{ p: 0.5 }}>
                          <Tooltip title="View Restaurant" arrow>
                            <VisibilityIcon fontSize="small" />
                          </Tooltip>
                        </IconButton>
                      </Link>
                    </FlexContainer>
                    <FlexContainer sx={{ justifyContent: 'space-between' }}>
                      <Rating value={popupDetails.rating} size="small" readOnly />
                      <Text variant="sub">
                        {popupDetails.rating} ({popupDetails.count} reviews)
                      </Text>
                    </FlexContainer>
                    <Text
                      variant="sub"
                      sx={{ fontSize: '0.75rem', color: 'text.ternary' }}
                    >
                      {popupDetails.categories}
                    </Text>
                  </Popup>
                )}
                <Marker longitude={coordinates[0]} latitude={coordinates[1]}>
                  <Styles.Pin
                    hovering={+(i.id === hoverId)}
                    onMouseOver={() => popupHandler(i)}
                  />
                </Marker>
              </React.Fragment>
            );
          })}
          <NavigationControl position={'bottom-right'} showCompass={false} />
        </ReactMapGL>
      </Styles.MapContainer>
    </React.Fragment>
  );
};

export default React.memo(FavouritesMap);
