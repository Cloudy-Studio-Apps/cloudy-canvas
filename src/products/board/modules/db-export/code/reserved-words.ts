const words = (list: string) => new Set(list.split(/\s+/).filter(Boolean));

/** Lowercase words a name can't be (PHP class names, TS identifiers, unquoted SQL identifiers). */
export const RESERVED = {
  php: words(`
    abstract and array as bool break callable case catch class clone const continue declare default
    do echo else elseif empty enum extends false final finally float fn for foreach function global
    goto if implements include instanceof insteadof int interface isset iterable list match mixed
    namespace never new null object or parent print private protected public readonly require
    resource return self static string switch throw trait true try unset use var void while xor
    yield`),
  ts: words(`
    break case catch class const continue debugger default delete do else enum export extends false
    finally for function if import in instanceof new null return super switch this throw true try
    typeof var void while with implements interface let package private protected public static
    yield any boolean number string symbol object never unknown type`),
  mysql: words(`
    add all alter and as asc between by call case change check column condition constraint create
    cross current_date current_time current_timestamp database default delete desc describe distinct
    drop else exists explain false for foreign from fulltext grant group having if in index inner
    insert interval into is join key keys kill left like limit lock match natural not null on option
    or order outer primary procedure range read references regexp rename repeat replace require
    revoke right rlike schema select set show spatial table then to trigger true union unique unlock
    update usage use using values when where while with write`),
  postgres: words(`
    all analyse analyze and any array as asc asymmetric authorization binary both case cast check
    collate column constraint create cross current_catalog current_date current_role current_time
    current_timestamp current_user default deferrable desc distinct do else end except false fetch
    for foreign freeze from full grant group having ilike in initially inner intersect into is
    isnull join lateral leading left like limit localtime localtimestamp natural not notnull null
    offset on only or order outer overlaps placing primary references returning right select
    session_user similar some symmetric table tablesample then to trailing true union unique user
    using variadic verbose when where window with`),
} as const satisfies Record<string, ReadonlySet<string>>;
