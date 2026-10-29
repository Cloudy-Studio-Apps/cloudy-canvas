/** A relation method of a model. */
export interface LaravelRelation {
  /** Method name, e.g. `order`, `orderItems`. */
  name: string;
  /** `BelongsTo`, `HasMany`, `HasOne` or `BelongsToMany`. */
  type: string;
  /** e.g. `$this->belongsTo(Order::class)`. */
  call: string;
}
