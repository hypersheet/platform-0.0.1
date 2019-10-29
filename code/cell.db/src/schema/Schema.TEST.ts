import { expect } from '../test';
import { Schema } from '.';

describe('schema', () => {
  describe('namespace', () => {
    it('existing id', () => {
      const res = Schema.ns('abc');
      expect(res.id).to.eql('abc');
    });

    it('generated id', () => {
      const res = Schema.ns();
      expect(res.id.length).to.greaterThan(10);
    });

    it('has path', () => {
      const res = Schema.ns('abc');
      expect(res.path).to.eql('NS/abc');
    });
  });

  describe('cell', () => {
    it('existing id', () => {
      const ns = Schema.ns('abc');
      const res = ns.cell('123');
      expect(res.id).to.eql('123');
      expect(res.path).to.eql('NS/abc/cell/123');
    });

    it('generated id', () => {
      const ns = Schema.ns('abc');
      const res = ns.cell();
      expect(res.id.length).to.eql(8);
      expect(res.path).to.eql(`NS/abc/cell/${res.id}`);
    });
  });

  describe('col', () => {
    it('existing id', () => {
      const ns = Schema.ns('abc');
      const res = ns.column('123');
      expect(res.id).to.eql('123');
      expect(res.path).to.eql('NS/abc/col/123');
    });

    it('generated id', () => {
      const ns = Schema.ns('abc');
      const res = ns.column();
      expect(res.id.length).to.eql(8);
      expect(res.path).to.eql(`NS/abc/col/${res.id}`);
    });
  });

  describe('row', () => {
    it('existing id', () => {
      const ns = Schema.ns('abc');
      const res = ns.row('123');
      expect(res.id).to.eql('123');
      expect(res.path).to.eql('NS/abc/row/123');
    });

    it('generated id', () => {
      const ns = Schema.ns('abc');
      const res = ns.row();
      expect(res.id.length).to.eql(8);
      expect(res.path).to.eql(`NS/abc/row/${res.id}`);
    });
  });
});
