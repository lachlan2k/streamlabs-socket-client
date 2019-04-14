import EventEmitter from 'eventemitter3';
import ioClient from 'socket.io-client';

import { removeCommas, removeNonNumeric } from './helpers';

class StreamlabsClient extends EventEmitter {
  baseURL = 'https://sockets.streamlabs.com/?token=';
  token = null;
  client = null;
  rawEvents = [];
  idTable = new Set();

  constructor (options) {
    super();

    const {
      token,
      emitTests,
      rawEvents,
    } = options;

    if (!token || typeof token !== 'string') {
      throw new Error('StreamlabsClient constructor expected \'token\' to be a string with length longer than 0.');
    }

    if (Array.isArray(rawEvents)) {
      this.rawEvents = rawEvents;
    }

    Object.assign(this, {
      token,
      emitTests: !!emitTests,
    });
  }

  createClient () {
    const {
      baseURL,
      token,
      client,
    } = this;

    if (client) {
      return;
    }

    this.client = ioClient(baseURL + token, {
      autoConnect: false,
      // transports: ['websocket'],
      forceNode: true,
      forceJSONP: false,
      // debug: true,
    });

    this.hookEventListeners();
  }

  connect () {
    if (!this.client) {
      this.createClient();
    }

    this.client.connect();
  }

  disconnect () {
    if (this.client) {
      this.client.disconnect();
    }
  }

  handleEvent (event) {
    const { message, type } = event;


    // eslint-disable-next-line no-underscore-dangle
    if (this.idTable.has(message._id)) {
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    this.idTable.add(message._id);

    if (!this.emitTests && message && message.isTest) {
      return;
    }

    const isTest = !!message.isTest;

    switch (type) {
      case 'follow': {
        this.emit('follow', {
          ...message,
          isTest,
        });

        break;
      }

      case 'subscription': {
        const isResub = !!message.sub_type && message.sub_type === 'resub';

        if (isResub) {
          this.emit('resubscription', {
            ...message,
            months: removeCommas(message.months) || 0,
            formattedMonths: message.months,
            isTest,
          });
        } else {
          this.emit('subscription', {
            ...message,
            isTest,
          });
        }

        break;
      }

      case 'donation': {
        this.emit('donation', {
          ...message,
          amount: removeNonNumeric(message.amount),
          formattedAmount: (message.formattedAmount || message.formatted_amount || '').toString(),
          currency: message.currency || 'USD',
          isTest,
        });

        break;
      }

      case 'host': {
        this.emit('host', {
          ...message,
          viewers: removeNonNumeric(message.viewers),
          formattedViewers: message.viewers.toString(),
          isTest,
        });

        break;
      }

      case 'bits': {
        this.emit('bits', {
          ...message,
          amount: removeCommas(message.amount) || 0,
          formattedAmount: message.amount.toString(),
          isTest: !!message.isTest,
        });

        break;
      }

      default: {
        this.emit(type, {
          ...message,
          isTest,
        });

        break;
      }
    }
  }

  hookEventListeners () {
    this.client.on('event', (event) => {
      try {
        if (Array.isArray(event.message)) {
          event.message.forEach((message) => {
            this.handleEvent({
              type: event.type,
              for: event.for || '',
              message,
            });
          });
        }
      } catch (error) {
        this.emit('error', error);
      }
    });

    this.rawEvents.forEach((eventName) => {
      this.hookRawEventListener(eventName);
    });
  }

  hookRawEventListener (eventName) {
    this.client.on(eventName, (...data) => {
      this.emit(eventName, ...data);
    });
  }
}

export default StreamlabsClient;
