import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  LoadEvent,
} from 'typeorm';

@EventSubscriber()
export class EntitySubscriber implements EntitySubscriberInterface {
  afterLoad(entity: any, event: LoadEvent<any>) {
    console.log(event.metadata.targetName);
  }
}
