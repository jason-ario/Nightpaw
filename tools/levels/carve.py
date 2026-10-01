"""Shared helpers for the level scripts: carve rooms out of solid rock so openings line up."""


class R:
    def __init__(self, id, name, x, y, w, h, **kw):
        self.d = dict(id=id, name=name, x=x, y=y, **kw)
        self.w, self.h = w, h
        self.g = [['#'] * w for _ in range(h)]
        self.legend, self.ents, self.water = {}, [], []

    def carve(self, x0, y0, x1, y1, ch='.'):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.g[y][x] = ch
        return self

    def fill(self, x0, y0, x1, y1):
        return self.carve(x0, y0, x1, y1, '#')

    def plat(self, x0, x1, y):
        return self.carve(x0, y, x1, y, '=')

    def pins(self, x0, x1, y):
        return self.carve(x0, y, x1, y, '^')

    def put(self, x, y, ch, ent=None):
        self.g[y][x] = ch
        if ent is not None:
            self.legend[ch] = ent
        return self

    def ent(self, type, x, y, **kw):
        self.ents.append(dict(type=type, x=x, y=y, **kw))
        return self

    def decal(self, art, x, y, scale=0.5, **kw):
        return self.ent('decal', x, y, art=art, scale=scale, **kw)

    def pool(self, **kw):
        self.water.append(kw)
        return self

    def json(self):
        out = dict(self.d)
        out['rows'] = [''.join(r) for r in self.g]
        if self.legend: out['legend'] = self.legend
        if self.ents: out['entities'] = self.ents
        if self.water: out['water'] = self.water
        return out
