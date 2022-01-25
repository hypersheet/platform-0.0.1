import { expect, t, cuid, rx } from '../../../test';
import { PeerStrategy } from '.';
import { PeerNetbus } from '../common';

describe('PeerStrategy', () => {
  const self = cuid();
  const bus = rx.bus<t.PeerEvent>();
  const netbus = PeerNetbus({ self, bus });

  it('dispose', () => {
    const strategy = PeerStrategy({ bus, netbus });

    const fire = { root: 0, connection: 0 };
    strategy.dispose$.subscribe(() => fire.root++);
    strategy.connection.dispose$.subscribe(() => fire.connection++);

    strategy.dispose();
    strategy.dispose();
    strategy.dispose();

    expect(fire.root).to.eql(1);

    // NB: Disposes deeply.
    expect(fire.connection).to.eql(1);
  });

  describe('Connection', () => {
    it('default:true - autoPurgeOnClose', () => {
      const connection = PeerStrategy({ bus, netbus }).connection;
      expect(connection.autoPurgeOnClose).to.eql(true);
    });

    it('default:true - ensureClosed', () => {
      const connection = PeerStrategy({ bus, netbus }).connection;
      expect(connection.ensureClosed).to.eql(true);
    });
  });
});
