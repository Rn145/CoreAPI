const CHANNELS = {
  //special
  GET_IS_DEBUG: 'CoreAPI: get_is_debug_channel',
  GET_IS_PRODUCTION: 'CoreAPI: get_is_production_channel',

  //listenners
  CALL_EVENT: 'CoreAPI: call_event_channel',
  SUBSCRIBE: 'CoreAPI: subscribe_channel',
  UNSUBSCRIBE: 'CoreAPI: unsubscribe_channel',
  GET_EVENTS: 'CoreAPI: get_events_channel',
  HAS_EVENT: 'CoreAPI: has_event_channel',

  //methods
  EXECUTE: 'CoreAPI: execute_channel',
  EXECUTE_SYNC: 'CoreAPI: execute_channel_sync',
  GET_METHODS: 'CoreAPI: get_methods_channel',
}

export default CHANNELS;