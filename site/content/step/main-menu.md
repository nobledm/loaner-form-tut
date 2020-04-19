---
title: Main Menu
date: 2020-04-19T22:04:07.334Z
description: This can be skipped if you're not setting up a menu. This section
  will cover completing the preference screen by setting up a Base Activity to
  house the menu code and keep it out of our Main Activity, and a Preference
  Activity.
---
## Preference Activity

Quick'n easy! Create a new Java Class called *PrefsActivity*. Extend it to be a PreferenceActivity, override the onCreate method, and add a single line as seen below:

```java
public class PrefsActivity extends PreferenceActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        addPreferencesFromResource(R.xml.activity_prefs);
    }
}
```
All we did here was link it to that xml file we made in the setup stage.

## Base Activity
Now, everything we're doing here you could put in the Main Activity... But that makes our Main a little large and we really don't need it intermingling with anything in the Main so let's separate it out and provide a bonus should this app ever be expanded. A Base Activity can be extended by all other screens in the app which then means we never have to copy-paste any menu codes between screens.

So go ahead and create a new Java Class called *Base Activity*.

Next, extend *AppCompatActivity* and implement *SharedPreferences.OnSharedPreferenceChangeListener*. Your class should be all red squigglies. Go ahead and implement the missing methods (alt + enter). We'll get back to this.

At the top of the class create some variables:
```java
SharedPreferences prefs;
EditText etCoordName;
EditText etCoordPhone;
```
These will be accessed by our Main Activity and used to populate it with default values. As well as used by that change listener we made.

Next, override the *onCreate*, *onCreateOptionsMenu*, and *onOptionsItemSelected* methods. We won't be touching onCreate, but it needs to exist.

#### onCreateOptionsMenu

We need to do what's called 'inflating the menu'. This is a just a fancy term for a thing that reads an xml file that describes a layout and create objects from it. So replace the default return statement with the following:

```java
@Override
public boolean onCreateOptionsMenu(Menu menu) {
    MenuInflater inflater = getMenuInflater();
    inflater.inflate(R.menu.main_menu, menu);
    return true;
}
```

#### onOptionsItemsSelected

This is where the logic goes when a menu item is selected. Since we only have 1 menu item we could just use an if statement, but for good practice we'll use a switch -- better coverage should this ever be expanded in the future. All we're going to do is check that the *Settings* item is selected and then start that *PrefsActivity class* we made earlier.

```java
@Override
public boolean onOptionsItemSelected(MenuItem item) {
    switch(item.getItemId())
    {
        case R.id.menu_settings:
            startActivity(new Intent(this, PrefsActivity.class));
            break;
    }

    return true;
}
```

#### onSharedPreferenceChanged

This is the method that handles when a user changes any of the values in the preference screen. We just need to tell what fields we want it to watch and what variables to assign values to.

```java
@Override
public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
    String coordName = prefs.getString(
            getResources().getString(R.string.prefkey_name),
                getResources().getString(R.string.prefdefault_name)
    );
    String coordPhone = prefs.getString(
                getResources().getString(R.string.prefkey_phone),
                getResources().getString(R.string.prefdefault_phone)
    );

    etCoordName.setText(coordName);
    etCoordPhone.setText(coordPhone);
}
```

Note that I have these values hooked up to my string resources. What it's grabbing is the string keys "name" and "phone" respectively -- so if you didn't setup strings in the values folder you'll need to copy-paste whatever string you wrote in the *activity_prefs.xml* for the key values of those fields.


## Main Activity

Almost done! In order to have our menu show up we need to tell the Main Activity it exists. Since we made a Base Activity we can extend that instead of extending AppCompat, and then bring in those class level variables.

```java
public class MainActivity extends BaseActivity {

    static String coordName;
    static String coordPhone;

     @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Assign Defaults/Prefs
        prefs = PreferenceManager.getDefaultSharedPreferences(this);

        coordName = prefs.getString(
                getResources().getString(R.string.prefkey_name),
                getResources().getString(R.string.prefdefault_name)
        );
        coordPhone = prefs.getString(
                getResources().getString(R.string.prefkey_phone),
                getResources().getString(R.string.prefdefault_phone)
        );

        etCoordName = findViewById(R.id.et_coord_name);
        etCoordPhone = findViewById(R.id.et_coord_phone);
        etCoordName.setText(coordName);
        etCoordPhone.setText(coordPhone);

        prefs.registerOnSharedPreferenceChangeListener(this);
    }
}
```

I've put the coordName/Phone variables as class level because we will use them in another method of the Main Activity when submitting the form. All we're doing here is setting the default values of some Edit Texts *(to be made in the next step)* and registering our preference change listener.

## That's A Menu

Next we'll be delving into throwing together our main layout and simple form fields.