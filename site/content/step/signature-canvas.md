---
title: Signature Canvas
date: 2020-04-20T14:21:13.988Z
description: Really just a plain ol' canvas whose purpose will be for
  signatures. We're going to handle setting up a Signature Class to handle all
  the drawing, and drawing related things, for us.
---
## Making Our Handler

For just ease of this tutorial we'll be putting this custom class at the bottom of our Main Activity.

To begin, we're going to need a few more class level variables at the top of Main:

```java
String sigPath;
private signature mSig;
private Bitmap sigBitmap;
LinearLayout sigCanvas;
View view;
```

And we need to initialize them inside our onCreate:

```java
// Setup Canvas
sigCanvas = findViewById(R.id.canvas_signature);
mSig = new signature(getApplicationContext(), null);
mSig.setBackgroundColor(Color.WHITE);

sigCanvas.addView(mSig, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
view = sigCanvas;
```

To get our canvas working we need to grab it from our layout, create a new instance of our custom class and pass it the context, give it a background as otherwise it defaults to black, and then add it to our view.

Now let's move on to our custom class.


### signature

```java
public class signature extends View {

    private static final float STROKE_WIDTH = 5f;
    private static final float HALF_STROKE = STROKE_WIDTH / 2;
    private Paint paint = new Paint();
    private Path path = new Path();
    private float lastX, lastY;
    private final RectF prevRect = new RectF();

    public signature(Context context, AttributeSet attrs) {
        super(context, attrs);
    }
}
```
\
To start we're setting up some constants that will be used throughout the various methods of our class. Paint acts like a brush and Path is, well, self-explanatory.

So let's define our brush just after the super call:

```java
paint.setAntiAlias(true);
paint.setColor(Color.BLACK);
paint.setStyle(Paint.Style.STROKE);
paint.setStrokeJoin(Paint.Join.ROUND);
paint.setStrokeWidth(STROKE_WIDTH);
```
AntiAlias smooths out our drawing a bit and we want the Style to be Stroke since we're capturing a signature and not filling a shape. The join is just for further smoothing, and feel free to play around with the color.

Next, let's override a couple methods: *onDraw* and *onTouchEvent*

##### onDraw
```java
@Override
protected void onDraw(Canvas canvas) {
    getParent().requestDisallowInterceptTouchEvent(true);
    canvas.drawPath(path, paint);
}
``` 
Note, unless your canvas is inside of a scrollview the 'Disallow' line is not needed. That first line is there to help the app figure out what to do when there are colliding touch events over top of the canvas. Without that line the scrollview would conflict with drawing on the canvas.

##### onTouchEvent
```java
@Override
public boolean onTouchEvent(MotionEvent event) {
    float eventX = event.getX();
    float eventY = event.getY();

    switch (event.getAction()) {
        case MotionEvent.ACTION_DOWN:
            path.moveTo(eventX, eventY);
            lastX = eventX;
            lastY = eventY;
            return true;

        case MotionEvent.ACTION_MOVE: {}
        case MotionEvent.ACTION_UP:
            resetPrevRect(eventX, eventY);
            int historySize = event.getHistorySize();
            for (int i = 0; i < historySize; i++) {
                float historicalX = event.getHistoricalX(i);
                float historicalY = event.getHistoricalY(i);
                expandPrevRect(historicalX, historicalY);
                path.lineTo(historicalX, historicalY);
            }
            path.lineTo(eventX, eventY);
            break;

        default:
            // Ignored touch event
            return false;
    }

    invalidate((int) (prevRect.left - HALF_STROKE),
            (int) (prevRect.top - HALF_STROKE),
            (int) (prevRect.right + HALF_STROKE),
            (int) (prevRect.bottom + HALF_STROKE));

    lastX = eventX;
    lastY = eventY;

    return true;
}
```
\
So what's this doing?\
Well, this is what's capturing the user's movements on the canvas. We track the X/Y values of their touch and handle each different action type through a switch statement. We're using *ACTION_DOWN* instead of *MOVE* to handle quick taps, like dotting the i's. The *ACTION_UP* resets our shape and saves the historical points drawn -- as we don't want the lines to connect again if the user resumes drawing on another section of the canvas.

*invalidate* is a very important thing that could probably use a better name. Invalidate forces a redraw on the screen and allows us the effect of 'real time' drawing. If you don't do that step, nothing will show on your canvas.

*resetPrevRect* and *expandPrevRect* are methods we have to make, so let's go do that now.

##### resetPrevRect
```java
private void resetPrevRect(float eventX, float eventY) {
    prevRect.left = Math.min(lastX, eventX);
    prevRect.right = Math.max(lastX, eventX);
    prevRect.top = Math.min(lastY, eventY);
    prevRect.bottom = Math.max(lastY, eventY);
}
```
Just resets the drawn space to fit the full canvas view.

##### expandPrevRect
```java
private void expandPrevRect(float historicalX, float historicalY) {
    if (historicalX < prevRect.left)
        prevRect.left = historicalX;
    else if (historicalX > prevRect.right)
        prevRect.right = historicalX;

    if (historicalY < prevRect.top)
        prevRect.top = historicalY;
    else if (historicalY > prevRect.bottom)
        prevRect.bottom = historicalY;
}
```
When another 'shape' is drawn on the same canvas expand the existing shape to encompass it.

Almost done; just 2 more methods. Let's get the easy one over with: **clear**.

```java
public void clear() {
    path.reset();
    invalidate();
}
```
That's it. Reset our path and redraw the canvas.

Now for the last thing in our custom class: **save**.

```java
public void save(View v, String path) {
    if (sigBitmap == null)
        sigBitmap = Bitmap.createBitmap(sigCanvas.getWidth(),
                sigCanvas.getHeight(),
                Bitmap.Config.RGB_565);

    Canvas canvas = new Canvas(sigBitmap);
    try {
        FileOutputStream mFOS = new FileOutputStream(path);
        v.draw(canvas);

        sigBitmap.compress(Bitmap.CompressFormat.JPEG, 90, mFOS);
        mFOS.flush();
        mFOS.close();
    } 
    catch (Exception e) { // Error handling here }
}
```

Now, this isn't perfect. The first if is trying to prevent blank canvas' from saving but that doesn't work. The gist of this is pretty simple though, given a file path take what's drawn on the canvas, open a file stream, and save it there. That's what we setup the sigPath for, to be treated just like the imagePath for the Camera.


## Back to Our Buttons

Our canvas should be drawing now, but we need to hook up the Clear & Finish buttons. Simple enough, edit in the logic to our *onClick* switch statement we made earlier.

```java
@Override
public void onClick(View v) {
    switch(v.getId()) {
        case R.id.btn_takePic:
            // camera stuff here
        case R.id.btn_clearsignature:
            mSig.clear();
            break;
        case R.id.btn_form_save:
            File sigFile = null;
            try {
                sigFile = createImageFile(0);

                if (sigFile != null) {
                    mSig.save(view, sigPath);
                else {
                    Toast.makeText(this,
                            "Please fill all necessary fields: Telescope, Lending Period, Borrower Name & Number",
                            Toast.LENGTH_SHORT
                    ).show();
                }
            }
            catch (Exception e) { // erorr handling }
            break;
    }
}
```

But we're not quite done yet!

We have to go back into our **createImageFile** method and add in the other part of the if statement to handle our sigPath assignment.

```java
private File createImageFile(int reqCode) throws IOException {
    // prev code for file setup

    if (reqCode == REQUEST_IMAGE_CAPTURE)
        imagePath = file.getAbsolutePath();
    else
        sigPath = file.getAbsolutePath();

    return file;
}
```

## Canvas Done!
Just one part left -- emailing the form and everything in it. That's right! Including the photo & signature.