import {
  AnyEventObject,
  assign,
  createMachine,
  EventObject,
  interpret,
  send,
  State,
  StateMachine,
} from 'xstate';
import { createModel } from 'xstate/lib/model';
import { AnyStateMachine } from './types';

export const createSimModel = (machine: StateMachine<any, any, any>) =>
  createModel(
    {
      state: machine.initialState,
      machine,
      machines: [] as AnyStateMachine[],
      events: [] as EventObject[],
      previewEvent: undefined as string | undefined,
    },
    {
      events: {
        'STATE.UPDATE': (state: State<any, any, any, any>) => ({ state }),
        EVENT: (event: AnyEventObject) => ({ event }),
        'MACHINES.UPDATE': (machines: Array<AnyStateMachine>) => ({
          machines,
        }),
        'EVENT.PREVIEW': (eventType: string) => ({ eventType }),
        'PREVIEW.CLEAR': () => ({}),
      },
    },
  );

export const createSimulationMachine = (
  machine: StateMachine<any, any, any>,
) => {
  const simModel = createSimModel(machine);
  return createMachine<typeof simModel>({
    context: simModel.initialContext,
    initial: 'active',
    states: {
      active: {
        invoke: {
          id: 'machine',
          src: (ctx) => (sendBack, onReceive) => {
            const service = interpret(ctx.machine)
              .onTransition((state) => {
                sendBack({
                  type: 'STATE.UPDATE',
                  state,
                });
              })
              .start();

            onReceive((event) => {
              service.send(event);
            });

            return () => {
              service.stop();
            };
          },
        },
        on: {
          'MACHINES.UPDATE': {
            target: 'active',
            internal: false,
            actions: [
              simModel.assign({
                machine: (_, e) => e.machines[0],
                machines: (_, e) => e.machines,
              }),
            ],
          },
          'EVENT.PREVIEW': {
            actions: simModel.assign({
              previewEvent: (_, event) => event.eventType,
            }),
          },
          'PREVIEW.CLEAR': {
            actions: simModel.assign({ previewEvent: undefined }),
          },
        },
      },
    },
    on: {
      'STATE.UPDATE': {
        actions: assign({ state: (_, e) => e.state }),
      },

      EVENT: {
        actions: [
          simModel.assign({
            events: (ctx, e) => ctx.events.concat(e.event),
          }),
          send(
            (ctx, e) => {
              const eventSchema = ctx.machine.schema?.events?.[e.event.type];
              const eventToSend = { ...e.event };

              if (eventSchema) {
                Object.keys(eventSchema.properties).forEach((prop) => {
                  const value = prompt(
                    `Enter value for "${prop}" (${eventSchema.properties[prop].type}):`,
                  );

                  eventToSend[prop] = value;
                });
              }
              return eventToSend;
            },
            { to: 'machine' },
          ),
        ],
      },
    },
  });
};